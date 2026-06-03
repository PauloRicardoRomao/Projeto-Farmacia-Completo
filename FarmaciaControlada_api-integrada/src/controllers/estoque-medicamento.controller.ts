import { Request, Response } from "express";
import { Includeable } from "sequelize";

import sequelize from "../config/config";

import Empresa from "../models/empresa.model";
import EstoqueMedicamento from "../models/estoque-medicamento.model";
import ItemEstoqueMedicamento from "../models/item-estoque-medicamento.model";
import MedicamentoFormaFarmaco from "../models/medicamento-forma-farmaco.model";
import Medicamento from "../models/medicamento.model";
import FormaFarmacoMedicamento from "../models/forma-farmaco-medicamento.model";
import TriagemDoacao from "../models/triagem-doacao.model";

type MovimentarEstoqueBody = {
  empresaId: number;
  medicamentoFormaFarmacoId: number;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  quantidadeMinima?: number;
  triagemDoacaoId?: number | null;
  observacao?: string | null;
};

type AtualizarEstoqueBody = {
  quantidadeMinima?: number;
  ativo?: boolean;
};

const estoqueInclude: Includeable[] = [
  {
    model: Empresa,
    as: "empresa",
    attributes: {
      exclude: ["senhaHash"],
    },
  },
  {
    model: MedicamentoFormaFarmaco,
    as: "medicamentoFormaFarmaco",
    include: [
      {
        model: Medicamento,
        as: "medicamento",
      },
      {
        model: FormaFarmacoMedicamento,
        as: "formaFarmaco",
      },
    ],
  },
  {
    model: ItemEstoqueMedicamento,
    as: "itensEstoqueMedicamento",
    required: false,
    where: {
      ativo: true,
    },
  },
];

function validarQuantidade(quantidade: number) {
  return Number.isFinite(quantidade) && quantidade > 0;
}

class EstoqueMedicamentoController {
  async movimentar(req: Request<{}, {}, MovimentarEstoqueBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const {
        empresaId,
        medicamentoFormaFarmacoId,
        tipo,
        quantidade,
        quantidadeMinima,
        triagemDoacaoId = null,
        observacao = null,
      } = req.body;

      if (!empresaId || !medicamentoFormaFarmacoId || !tipo || !quantidade) {
        await transaction.rollback();

        return res.status(400).json({
          message:
            "Empresa, medicamento/forma, tipo e quantidade são obrigatórios.",
        });
      }

      if (tipo !== "entrada" && tipo !== "saida" && tipo !== "ajuste") {
        await transaction.rollback();

        return res.status(400).json({
          message: "Tipo de movimentação inválido.",
        });
      }

      if (!validarQuantidade(quantidade)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "A quantidade precisa ser maior que zero.",
        });
      }

      if (quantidadeMinima !== undefined && quantidadeMinima < 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "A quantidade mínima não pode ser negativa.",
        });
      }

      const empresa = await Empresa.findOne({
        where: {
          id: empresaId,
          ativo: true,
        },
        transaction,
      });

      if (!empresa) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Empresa não encontrada.",
        });
      }

      const medicamentoFormaFarmaco = await MedicamentoFormaFarmaco.findOne({
        where: {
          id: medicamentoFormaFarmacoId,
          ativo: true,
        },
        transaction,
      });

      if (!medicamentoFormaFarmaco) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Medicamento/forma farmacêutica não encontrado.",
        });
      }

      if (tipo === "entrada" && triagemDoacaoId) {
        const triagem = await TriagemDoacao.findOne({
          where: {
            id: triagemDoacaoId,
            ativo: true,
            aprovado: true,
          },
          transaction,
        });

        if (!triagem) {
          await transaction.rollback();

          return res.status(404).json({
            message: "Triagem de doação aprovada não encontrada.",
          });
        }
      }

      let estoque = await EstoqueMedicamento.findOne({
        where: {
          empresaId,
          medicamentoFormaFarmacoId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!estoque) {
        if (tipo === "saida") {
          await transaction.rollback();

          return res.status(400).json({
            message:
              "Não existe estoque cadastrado para realizar uma saída deste medicamento.",
          });
        }

        estoque = await EstoqueMedicamento.create(
          {
            empresaId,
            medicamentoFormaFarmacoId,
            quantidadeMinima: quantidadeMinima ?? 0,
            quantidadeAtual: 0,
            ativo: true,
          },
          { transaction },
        );
      }

      if (!estoque.ativo) {
        await estoque.update(
          {
            ativo: true,
          },
          { transaction },
        );
      }

      const quantidadeAtual = Number(estoque.quantidadeAtual);

      let novaQuantidadeAtual = quantidadeAtual;

      if (tipo === "entrada") {
        novaQuantidadeAtual = quantidadeAtual + quantidade;
      }

      if (tipo === "saida") {
        novaQuantidadeAtual = quantidadeAtual - quantidade;
      }

      if (tipo === "ajuste") {
        novaQuantidadeAtual = quantidade;
      }

      if (novaQuantidadeAtual < 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Estoque insuficiente para realizar a saída.",
        });
      }

      await ItemEstoqueMedicamento.create(
        {
          estoqueMedicamentoId: estoque.id,
          triagemDoacaoId,
          tipo,
          quantidade,
          observacao,
          ativo: true,
        },
        { transaction },
      );

      await estoque.update(
        {
          quantidadeAtual: novaQuantidadeAtual,
          quantidadeMinima: quantidadeMinima ?? estoque.quantidadeMinima,
          ativo: true,
        },
        { transaction },
      );

      const estoqueAtualizado = await EstoqueMedicamento.findByPk(estoque.id, {
        include: estoqueInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(201).json({
        message:
          tipo === "entrada"
            ? "Entrada registrada com sucesso."
            : tipo === "saida"
              ? "Saida registrada com sucesso."
              : "Ajuste registrado com sucesso.",
        estoque: estoqueAtualizado,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao movimentar estoque.",
        error,
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const { empresaId, baixo } = req.query;

      const where: {
        ativo: boolean;
        empresaId?: number;
      } = {
        ativo: true,
      };

      if (empresaId) {
        const empresaIdNumber = Number(empresaId);

        if (Number.isNaN(empresaIdNumber)) {
          return res.status(400).json({
            message: "empresaId inválido.",
          });
        }

        where.empresaId = empresaIdNumber;
      }

      const estoques = await EstoqueMedicamento.findAll({
        where,
        include: estoqueInclude,
        order: [["createdAt", "DESC"]],
      });

      const resultado =
        baixo === "true"
          ? estoques.filter(
              (estoque) => estoque.quantidadeAtual <= estoque.quantidadeMinima,
            )
          : estoques;

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar estoque.",
        error,
      });
    }
  }

  async findByEmpresa(req: Request<{ empresaId: string }>, res: Response) {
    try {
      const { empresaId } = req.params;
      const empresaIdNumber = Number(empresaId);

      if (Number.isNaN(empresaIdNumber)) {
        return res.status(400).json({
          message: "ID da empresa inválido.",
        });
      }

      const estoques = await EstoqueMedicamento.findAll({
        where: {
          empresaId: empresaIdNumber,
          ativo: true,
        },
        include: estoqueInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(estoques);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar estoque da empresa.",
        error,
      });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const estoqueId = Number(id);

      if (Number.isNaN(estoqueId)) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const estoque = await EstoqueMedicamento.findOne({
        where: {
          id: estoqueId,
          ativo: true,
        },
        include: estoqueInclude,
      });

      if (!estoque) {
        return res.status(404).json({
          message: "Estoque não encontrado.",
        });
      }

      return res.status(200).json(estoque);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar estoque.",
        error,
      });
    }
  }

  async atualizarConfiguracao(
    req: Request<{ id: string }, {}, AtualizarEstoqueBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const estoqueId = Number(id);
      const { quantidadeMinima, ativo } = req.body;

      if (Number.isNaN(estoqueId)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      if (quantidadeMinima !== undefined && quantidadeMinima < 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "A quantidade mínima não pode ser negativa.",
        });
      }

      const estoque = await EstoqueMedicamento.findOne({
        where: {
          id: estoqueId,
        },
        transaction,
      });

      if (!estoque) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Estoque não encontrado.",
        });
      }

      await estoque.update(
        {
          quantidadeMinima: quantidadeMinima ?? estoque.quantidadeMinima,
          ativo: ativo ?? estoque.ativo,
        },
        { transaction },
      );

      const estoqueAtualizado = await EstoqueMedicamento.findByPk(estoque.id, {
        include: estoqueInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        message: "Configuração do estoque atualizada com sucesso.",
        estoque: estoqueAtualizado,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao atualizar configuração do estoque.",
        error,
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const estoqueId = Number(id);

      if (Number.isNaN(estoqueId)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const estoque = await EstoqueMedicamento.findOne({
        where: {
          id: estoqueId,
          ativo: true,
        },
        transaction,
      });

      if (!estoque) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Estoque não encontrado.",
        });
      }

      estoque.ativo = false;
      await estoque.save({ transaction });

      await transaction.commit();

      return res.status(200).json({
        message: "Estoque removido com sucesso.",
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao remover estoque.",
        error,
      });
    }
  }
}

export default new EstoqueMedicamentoController();
