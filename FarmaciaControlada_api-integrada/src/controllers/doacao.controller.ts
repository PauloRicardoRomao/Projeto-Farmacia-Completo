import { Request, Response } from "express";
import { Includeable } from "sequelize";

import sequelize from "../config/config";

import Doacao from "../models/doacao.model";
import MedicamentoDoacao from "../models/medicamento-doacao.model";
import TriagemDoacao from "../models/triagem-doacao.model";
import EstoqueMedicamento from "../models/estoque-medicamento.model";
import ItemEstoqueMedicamento from "../models/item-estoque-medicamento.model";
import MedicamentoFormaFarmaco from "../models/medicamento-forma-farmaco.model";
import Medicamento from "../models/medicamento.model";
import FormaFarmacoMedicamento from "../models/forma-farmaco-medicamento.model";

type ItemDoacaoInput = {
  medicamentoFormaFarmacoId: number;
  quantidade: number;
  validade: string;
};

type CreateDoacaoBody = {
  cpf: string;
  itens: ItemDoacaoInput[];
};

type AprovarTriagemBody = {
  empresaId: number;
  quantidadeMinima?: number;
  observacao?: string | null;
};

const doacaoInclude: Includeable[] = [
  {
    model: MedicamentoDoacao,
    as: "medicamentoDoacoes",
    required: false,
    where: {
      ativo: true,
    },
    include: [
      {
        model: TriagemDoacao,
        as: "triagemDoacao",
        required: false,
      },
      {
        model: MedicamentoFormaFarmaco,
        as: "medicamentoFormaFarmaco",
        required: false,
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
    ],
  },
];

function validarId(valor: unknown) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function validarQuantidade(valor: unknown) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

class DoacaoController {
  async create(req: Request<{}, {}, CreateDoacaoBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const { cpf, itens } = req.body;

      if (!cpf) {
        await transaction.rollback();

        return res.status(400).json({
          message: "CPF do doador é obrigatório.",
        });
      }

      if (!itens || itens.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "A doação precisa ter pelo menos um medicamento.",
        });
      }

      const cpfLimpo = cpf.replace(/\D/g, "");

      if (cpfLimpo.length !== 11) {
        await transaction.rollback();

        return res.status(400).json({
          message: "CPF inválido.",
        });
      }

      for (const item of itens) {
        const medicamentoFormaFarmacoId = validarId(
          item.medicamentoFormaFarmacoId,
        );

        const quantidade = validarQuantidade(item.quantidade);

        if (!medicamentoFormaFarmacoId || !quantidade || !item.validade) {
          await transaction.rollback();

          return res.status(400).json({
            message:
              "Cada item precisa ter medicamentoFormaFarmacoId, quantidade e validade.",
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
            message:
              "Um ou mais medicamentos/formas farmacêuticas não foram encontrados.",
          });
        }
      }

      const doacao = await Doacao.create(
        {
          cpf: cpfLimpo,
          ativo: true,
        },
        { transaction },
      );

      for (const item of itens) {
        const medicamentoFormaFarmacoId = Number(
          item.medicamentoFormaFarmacoId,
        );

        const medicamentoFormaFarmaco = await MedicamentoFormaFarmaco.findByPk(
          medicamentoFormaFarmacoId,
          {
            transaction,
          },
        );

        if (!medicamentoFormaFarmaco) {
          await transaction.rollback();

          return res.status(404).json({
            message: "Medicamento/forma farmacêutica não encontrado.",
          });
        }

        const medicamentoDoacao = await MedicamentoDoacao.create(
          {
            doacaoId: doacao.id,
            medicamentoFormaFarmacoId,
            quantidade: Number(item.quantidade),
            ativo: true,
          },
          { transaction },
        );

        await TriagemDoacao.create(
          {
            medicamentoDoacaoId: medicamentoDoacao.id,
            validade: new Date(item.validade),
            aprovado: false,
            ativo: true,
          },
          { transaction },
        );
      }

      const doacaoCriada = await Doacao.findByPk(doacao.id, {
        include: doacaoInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(201).json({
        message: "Doação cadastrada com sucesso.",
        doacao: doacaoCriada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao cadastrar doação.",
        error,
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const doacoes = await Doacao.findAll({
        where: {
          ativo: true,
        },
        include: doacaoInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(doacoes);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar doações.",
        error,
      });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const doacaoId = validarId(req.params.id);

      if (!doacaoId) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const doacao = await Doacao.findOne({
        where: {
          id: doacaoId,
          ativo: true,
        },
        include: doacaoInclude,
      });

      if (!doacao) {
        return res.status(404).json({
          message: "Doação não encontrada.",
        });
      }

      return res.status(200).json(doacao);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar doação.",
        error,
      });
    }
  }

  async aprovarTriagem(
    req: Request<{ triagemId: string }, {}, AprovarTriagemBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const triagemId = validarId(req.params.triagemId);
      const { empresaId, quantidadeMinima = 0, observacao = null } = req.body;

      const empresaIdNumber = validarId(empresaId);

      if (!triagemId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID da triagem inválido.",
        });
      }

      if (!empresaIdNumber) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Empresa é obrigatória.",
        });
      }

      if (quantidadeMinima < 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Quantidade mínima não pode ser negativa.",
        });
      }

      const triagem = await TriagemDoacao.findOne({
        where: {
          id: triagemId,
          ativo: true,
        },
        include: [
          {
            model: MedicamentoDoacao,
            as: "medicamentoDoacao",
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!triagem) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Triagem não encontrada.",
        });
      }

      if (triagem.aprovado) {
        await transaction.rollback();

        return res.status(409).json({
          message: "Esta triagem já foi aprovada.",
        });
      }

      const medicamentoDoacao = triagem.medicamentoDoacao;

      if (!medicamentoDoacao) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Medicamento da doação não encontrado.",
        });
      }

      const medicamentoFormaFarmacoId =
        medicamentoDoacao.medicamentoFormaFarmacoId;

      const quantidade = Number(medicamentoDoacao.quantidade);

      if (!medicamentoFormaFarmacoId || quantidade <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          message:
            "Medicamento da doação está sem medicamentoFormaFarmacoId ou quantidade.",
        });
      }

      let estoque = await EstoqueMedicamento.findOne({
        where: {
          empresaId: empresaIdNumber,
          medicamentoFormaFarmacoId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!estoque) {
        estoque = await EstoqueMedicamento.create(
          {
            empresaId: empresaIdNumber,
            medicamentoFormaFarmacoId,
            quantidadeMinima,
            quantidadeAtual: 0,
            ativo: true,
          },
          { transaction },
        );
      }

      const novaQuantidadeAtual = Number(estoque.quantidadeAtual) + quantidade;

      await ItemEstoqueMedicamento.create(
        {
          estoqueMedicamentoId: estoque.id,
          triagemDoacaoId: triagem.id,
          tipo: "entrada",
          quantidade,
          observacao,
          ativo: true,
        },
        { transaction },
      );

      await estoque.update(
        {
          quantidadeAtual: novaQuantidadeAtual,
          quantidadeMinima,
          ativo: true,
        },
        { transaction },
      );

      await triagem.update(
        {
          aprovado: true,
        },
        { transaction },
      );

      const doacaoAtualizada = await Doacao.findByPk(
        medicamentoDoacao.doacaoId,
        {
          include: doacaoInclude,
          transaction,
        },
      );

      await transaction.commit();

      return res.status(200).json({
        message: "Triagem aprovada e entrada registrada no estoque.",
        doacao: doacaoAtualizada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao aprovar triagem.",
        error,
      });
    }
  }

  async reprovarTriagem(req: Request<{ triagemId: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const triagemId = validarId(req.params.triagemId);

      if (!triagemId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID da triagem inválido.",
        });
      }

      const triagem = await TriagemDoacao.findOne({
        where: {
          id: triagemId,
          ativo: true,
        },
        transaction,
      });

      if (!triagem) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Triagem não encontrada.",
        });
      }

      if (triagem.aprovado) {
        await transaction.rollback();

        return res.status(409).json({
          message: "Não é possível reprovar uma triagem já aprovada.",
        });
      }

      await triagem.update(
        {
          ativo: false,
        },
        { transaction },
      );

      await transaction.commit();

      return res.status(200).json({
        message: "Triagem reprovada com sucesso.",
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao reprovar triagem.",
        error,
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const doacaoId = validarId(req.params.id);

      if (!doacaoId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const doacao = await Doacao.findOne({
        where: {
          id: doacaoId,
          ativo: true,
        },
        transaction,
      });

      if (!doacao) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Doação não encontrada.",
        });
      }

      await Doacao.update(
        {
          ativo: false,
        },
        {
          where: {
            id: doacaoId,
          },
          transaction,
        },
      );

      await MedicamentoDoacao.update(
        {
          ativo: false,
        },
        {
          where: {
            doacaoId,
          },
          transaction,
        },
      );

      await transaction.commit();

      return res.status(200).json({
        message: "Doação removida com sucesso.",
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao remover doação.",
        error,
      });
    }
  }
}

export default new DoacaoController();
