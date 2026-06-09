import { Request, Response } from "express";
import { Includeable } from "sequelize";

import sequelize from "../config/config";

import Usuario from "../models/usuario.model";
import Empresa from "../models/empresa.model";
import ReceitaUsuario from "../models/receita-usuario.model";
import ReceitaMedicamento from "../models/receita-medicamento.model";
import MedicamentoFormaFarmaco from "../models/medicamento-forma-farmaco.model";
import Medicamento from "../models/medicamento.model";
import FormaFarmacoMedicamento from "../models/forma-farmaco-medicamento.model";
import EstoqueMedicamento from "../models/estoque-medicamento.model";
import ItemEstoqueMedicamento from "../models/item-estoque-medicamento.model";

type ReceitaMedicamentoInput = {
  medicamentoFormaFarmacoId: number;
  quantidade: number;
  posologia?: string | null;
  continuo?: boolean;
};

type CreateReceitaBody = {
  usuarioId: number;
  crmMedico?: string | null;
  dataEmissao: string;
  dataVencimento?: string | null;
  observacao?: string | null;
  medicamentos: ReceitaMedicamentoInput[];
};

type UpdateReceitaBody = {
  crmMedico?: string | null;
  dataEmissao?: string;
  dataVencimento?: string | null;
  observacao?: string | null;
  medicamentos?: ReceitaMedicamentoInput[];
};

type ReceitaEmpresaBody = {
  empresaId: number;
  observacao?: string | null;
};

const receitaInclude: Includeable[] = [
  {
    model: Usuario,
    as: "usuario",
    attributes: {
      exclude: ["senhaHash"],
    },
  },
  {
    model: Empresa,
    as: "empresa",
    required: false,
    attributes: {
      exclude: ["senhaHash"],
    },
  },
  {
    model: ReceitaMedicamento,
    as: "receitasMedicamentos",
    required: false,
    where: {
      ativo: true,
    },
    include: [
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

function validarData(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

async function validarMedicamentosReceita(
  medicamentos: ReceitaMedicamentoInput[],
  transaction: Awaited<ReturnType<typeof sequelize.transaction>>,
) {
  for (const item of medicamentos) {
    const medicamentoFormaFarmacoId = validarId(item.medicamentoFormaFarmacoId);
    const quantidade = validarQuantidade(item.quantidade);

    if (!medicamentoFormaFarmacoId || !quantidade) {
      return "Cada medicamento precisa ter medicamentoFormaFarmacoId e quantidade válida.";
    }

    const medicamentoFormaFarmaco = await MedicamentoFormaFarmaco.findOne({
      where: {
        id: medicamentoFormaFarmacoId,
        ativo: true,
      },
      transaction,
    });

    if (!medicamentoFormaFarmaco) {
      return "Um ou mais medicamentos/formas farmacêuticas não foram encontrados.";
    }
  }

  return null;
}

class ReceitaController {
  async create(req: Request<{}, {}, CreateReceitaBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const {
        usuarioId,
        crmMedico,
        dataEmissao,
        dataVencimento,
        observacao,
        medicamentos,
      } = req.body;

      const usuarioIdNumber = validarId(usuarioId);

      if (!usuarioIdNumber) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Usuário é obrigatório.",
        });
      }

      const dataEmissaoDate = validarData(dataEmissao);

      if (!dataEmissaoDate) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Data de emissão inválida.",
        });
      }

      const dataVencimentoDate = dataVencimento
        ? validarData(dataVencimento)
        : null;

      if (dataVencimento && !dataVencimentoDate) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Data de vencimento inválida.",
        });
      }

      if (!medicamentos || medicamentos.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "A receita precisa ter pelo menos um medicamento.",
        });
      }

      const usuario = await Usuario.findOne({
        where: {
          id: usuarioIdNumber,
          ativo: true,
        },
        transaction,
      });

      if (!usuario) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Usuário não encontrado.",
        });
      }

      const erroMedicamentos = await validarMedicamentosReceita(
        medicamentos,
        transaction,
      );

      if (erroMedicamentos) {
        await transaction.rollback();

        return res.status(400).json({
          message: erroMedicamentos,
        });
      }

      const receita = await ReceitaUsuario.create(
        {
          usuarioId: usuarioIdNumber,
          empresaId: null,
          status: "pendente",
          crmMedico: crmMedico ?? null,
          dataEmissao: dataEmissaoDate,
          dataVencimento: dataVencimentoDate,
          observacao: observacao ?? null,
          ativo: true,
        },
        { transaction },
      );

      const itensReceita = medicamentos.map((item) => ({
        receitaUsuarioId: receita.id,
        medicamentoFormaFarmacoId: Number(item.medicamentoFormaFarmacoId),
        quantidade: Number(item.quantidade),
        posologia: item.posologia ?? null,
        continuo: item.continuo ?? false,
        ativo: true,
      }));

      await ReceitaMedicamento.bulkCreate(itensReceita, {
        transaction,
      });

      const receitaCriada = await ReceitaUsuario.findByPk(receita.id, {
        include: receitaInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(201).json({
        message: "Receita cadastrada e enviada para triagem.",
        receita: receitaCriada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao cadastrar receita.",
        error,
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const receitas = await ReceitaUsuario.findAll({
        where: {
          ativo: true,
        },
        include: receitaInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(receitas);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar receitas.",
        error,
      });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const receitaId = validarId(req.params.id);

      if (!receitaId) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaId,
          ativo: true,
        },
        include: receitaInclude,
      });

      if (!receita) {
        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      return res.status(200).json(receita);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar receita.",
        error,
      });
    }
  }

  async update(
    req: Request<{ id: string }, {}, UpdateReceitaBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const receitaId = validarId(req.params.id);

      if (!receitaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const {
        crmMedico,
        dataEmissao,
        dataVencimento,
        observacao,
        medicamentos,
      } = req.body;

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaId,
          ativo: true,
        },
        transaction,
      });

      if (!receita) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      if (receita.status !== "pendente") {
        await transaction.rollback();

        return res.status(409).json({
          message: "Somente receitas pendentes podem ser editadas.",
        });
      }

      let dataEmissaoDate: Date | undefined;

      if (dataEmissao) {
        const data = validarData(dataEmissao);

        if (!data) {
          await transaction.rollback();

          return res.status(400).json({
            message: "Data de emissão inválida.",
          });
        }

        dataEmissaoDate = data;
      }

      let dataVencimentoDate: Date | null | undefined;

      if (dataVencimento === null) {
        dataVencimentoDate = null;
      }

      if (dataVencimento) {
        const data = validarData(dataVencimento);

        if (!data) {
          await transaction.rollback();

          return res.status(400).json({
            message: "Data de vencimento inválida.",
          });
        }

        dataVencimentoDate = data;
      }

      await receita.update(
        {
          crmMedico:
            crmMedico !== undefined
              ? (crmMedico ?? null)
              : receita.crmMedico,
          dataEmissao: dataEmissaoDate ?? receita.dataEmissao,
          dataVencimento:
            dataVencimentoDate !== undefined
              ? dataVencimentoDate
              : receita.dataVencimento,
          observacao:
            observacao !== undefined
              ? (observacao ?? null)
              : receita.observacao,
        },
        { transaction },
      );

      if (medicamentos !== undefined) {
        if (medicamentos.length === 0) {
          await transaction.rollback();

          return res.status(400).json({
            message: "A receita precisa ter pelo menos um medicamento.",
          });
        }

        const erroMedicamentos = await validarMedicamentosReceita(
          medicamentos,
          transaction,
        );

        if (erroMedicamentos) {
          await transaction.rollback();

          return res.status(400).json({
            message: erroMedicamentos,
          });
        }

        await ReceitaMedicamento.update(
          {
            ativo: false,
          },
          {
            where: {
              receitaUsuarioId: receitaId,
            },
            transaction,
          },
        );

        const novosItens = medicamentos.map((item) => ({
          receitaUsuarioId: receitaId,
          medicamentoFormaFarmacoId: Number(item.medicamentoFormaFarmacoId),
          quantidade: Number(item.quantidade),
          posologia: item.posologia ?? null,
          continuo: item.continuo ?? false,
          ativo: true,
        }));

        await ReceitaMedicamento.bulkCreate(novosItens, {
          transaction,
        });
      }

      const receitaAtualizada = await ReceitaUsuario.findByPk(receita.id, {
        include: receitaInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        message: "Receita atualizada com sucesso.",
        receita: receitaAtualizada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao atualizar receita.",
        error,
      });
    }
  }

  async aprovar(
    req: Request<{ id: string }, {}, ReceitaEmpresaBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const receitaId = validarId(req.params.id);
      const empresaId = validarId(req.body.empresaId);

      if (!receitaId || !empresaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Receita e empresa são obrigatórias.",
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

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaId,
          ativo: true,
        },
        include: [
          {
            model: ReceitaMedicamento,
            as: "receitasMedicamentos",
            required: true,
            where: {
              ativo: true,
            },
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!receita) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      if (receita.status !== "pendente") {
        await transaction.rollback();

        return res.status(409).json({
          message: "Somente receitas pendentes podem ser aprovadas.",
        });
      }

      if (
        receita.dataVencimento &&
        new Date(receita.dataVencimento).getTime() < Date.now()
      ) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Receita vencida.",
        });
      }

      await receita.update(
        {
          empresaId,
          status: "aprovada",
          observacao: req.body.observacao ?? receita.observacao,
        },
        { transaction },
      );

      const receitaAtualizada = await ReceitaUsuario.findByPk(receita.id, {
        include: receitaInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        message: "Receita aprovada e autorizada para retirada.",
        receita: receitaAtualizada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao aprovar receita.",
        error,
      });
    }
  }

  async reprovar(
    req: Request<{ id: string }, {}, ReceitaEmpresaBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const receitaId = validarId(req.params.id);
      const empresaId = validarId(req.body.empresaId);

      if (!receitaId || !empresaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Receita e empresa são obrigatórias.",
        });
      }

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaId,
          ativo: true,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!receita) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      if (receita.status !== "pendente") {
        await transaction.rollback();

        return res.status(409).json({
          message: "Somente receitas pendentes podem ser reprovadas.",
        });
      }

      await receita.update(
        {
          empresaId,
          status: "rejeitada",
          observacao: req.body.observacao ?? receita.observacao,
        },
        { transaction },
      );

      const receitaAtualizada = await ReceitaUsuario.findByPk(receita.id, {
        include: receitaInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        message: "Receita reprovada.",
        receita: receitaAtualizada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao reprovar receita.",
        error,
      });
    }
  }

  async dispensar(
    req: Request<{ id: string }, {}, ReceitaEmpresaBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const receitaId = validarId(req.params.id);
      const empresaId = validarId(req.body.empresaId);
      const observacao =
        req.body.observacao ??
        `Saída por dispensação da receita ${req.params.id}.`;

      if (!receitaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID da receita inválido.",
        });
      }

      if (!empresaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Empresa é obrigatória.",
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

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaId,
          ativo: true,
        },
        include: [
          {
            model: ReceitaMedicamento,
            as: "receitasMedicamentos",
            required: true,
            where: {
              ativo: true,
            },
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!receita) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      if (receita.status !== "aprovada") {
        await transaction.rollback();

        return res.status(409).json({
          message: "A receita precisa estar aprovada antes da retirada.",
        });
      }

      if (
        receita.dataVencimento &&
        new Date(receita.dataVencimento).getTime() < Date.now()
      ) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Receita vencida.",
        });
      }

      const itens = receita.receitasMedicamentos ?? [];

      if (itens.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Receita não possui medicamentos ativos.",
        });
      }

      for (const item of itens) {
        const estoque = await EstoqueMedicamento.findOne({
          where: {
            empresaId,
            medicamentoFormaFarmacoId: item.medicamentoFormaFarmacoId,
            ativo: true,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!estoque) {
          await transaction.rollback();

          return res.status(400).json({
            message:
              "Um ou mais medicamentos da receita não existem no estoque da empresa.",
          });
        }

        const quantidadeAtual = Number(estoque.quantidadeAtual);
        const quantidadeReceita = Number(item.quantidade);

        if (quantidadeAtual < quantidadeReceita) {
          await transaction.rollback();

          return res.status(400).json({
            message:
              "Estoque insuficiente para um ou mais medicamentos da receita.",
          });
        }
      }

      for (const item of itens) {
        const estoque = await EstoqueMedicamento.findOne({
          where: {
            empresaId,
            medicamentoFormaFarmacoId: item.medicamentoFormaFarmacoId,
            ativo: true,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!estoque) {
          await transaction.rollback();

          return res.status(400).json({
            message: "Estoque não encontrado durante a dispensação.",
          });
        }

        const novaQuantidadeAtual =
          Number(estoque.quantidadeAtual) - Number(item.quantidade);

        await ItemEstoqueMedicamento.create(
          {
            estoqueMedicamentoId: estoque.id,
            triagemDoacaoId: null,
            tipo: "saida",
            quantidade: Number(item.quantidade),
            observacao,
            ativo: true,
          },
          { transaction },
        );

        await estoque.update(
          {
            quantidadeAtual: novaQuantidadeAtual,
          },
          { transaction },
        );
      }

      await receita.update(
        {
          empresaId,
          status: "dispensada",
        },
        { transaction },
      );

      const receitaAtualizada = await ReceitaUsuario.findByPk(receita.id, {
        include: receitaInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        message: "Medicamento retirado e estoque baixado com sucesso.",
        receita: receitaAtualizada,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao dispensar receita.",
        error,
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const receitaId = validarId(req.params.id);

      if (!receitaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaId,
          ativo: true,
        },
        transaction,
      });

      if (!receita) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      await ReceitaMedicamento.update(
        {
          ativo: false,
        },
        {
          where: {
            receitaUsuarioId: receitaId,
          },
          transaction,
        },
      );

      await receita.update(
        {
          ativo: false,
        },
        { transaction },
      );

      await transaction.commit();

      return res.status(200).json({
        message: "Receita removida com sucesso.",
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao remover receita.",
        error,
      });
    }
  }
}

export default new ReceitaController();
