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
  medicamentoFormaFarmacoId?: number;
  nomeMedicamento: string;
  descricaoMedicamento?: string;
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

function validarDataValidade(valor: string) {
  const texto = valor.trim();
  const mesAno = texto.match(/^(\d{2})\/(\d{4})$/);
  const diaMesAno = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (mesAno) {
    const mes = Number(mesAno[1]);
    const ano = Number(mesAno[2]);

    if (mes >= 1 && mes <= 12) {
      return new Date(ano, mes, 0, 23, 59, 59);
    }
  }

  if (diaMesAno) {
    const dia = Number(diaMesAno[1]);
    const mes = Number(diaMesAno[2]);
    const ano = Number(diaMesAno[3]);
    const data = new Date(ano, mes - 1, dia);

    if (
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia
    ) {
      return data;
    }
  }

  const data = new Date(texto);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
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
        const quantidade = validarQuantidade(item.quantidade);

        const validade = item.validade ? validarDataValidade(item.validade) : null;

        if (
          !item.nomeMedicamento ||
          !quantidade ||
          !validade
        ) {
          await transaction.rollback();

          return res.status(400).json({
            message:
              "Nome do medicamento, quantidade e validade válida são obrigatórios.",
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
        const medicamentoDoacao = await MedicamentoDoacao.create(
          {
            doacaoId: doacao.id,

            medicamentoFormaFarmacoId:
              item.medicamentoFormaFarmacoId || null,

            nomeMedicamento: item.nomeMedicamento,

            descricaoMedicamento:
              item.descricaoMedicamento || null,

            quantidade: Number(item.quantidade),

            ativo: true,
          },
          { transaction },
        );

        await TriagemDoacao.create(
          {
            medicamentoDoacaoId: medicamentoDoacao.id,
            validade: validarDataValidade(item.validade)!,
            status: "pendente",
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

      if (triagem.status === "aprovada" || triagem.aprovado) {
        await transaction.rollback();

        return res.status(409).json({
          message: "Esta triagem já foi aprovada.",
        });
      }

      if (triagem.status === "reprovada") {
        await transaction.rollback();

        return res.status(409).json({
          message: "Esta triagem já foi reprovada.",
        });
      }

      const medicamentoDoacao = triagem.medicamentoDoacao;

      if (!medicamentoDoacao) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Medicamento da doação não encontrado.",
        });
      }

      let medicamentoFormaFarmacoId =
        medicamentoDoacao.medicamentoFormaFarmacoId;

      const quantidade = Number(medicamentoDoacao.quantidade);

      if (!medicamentoFormaFarmacoId) {
        const nomeDoacao = medicamentoDoacao.nomeMedicamento.trim().toLowerCase();
        const medicamentosCatalogo = await Medicamento.findAll({
          where: {
            ativo: true,
          },
          include: [
            {
              model: MedicamentoFormaFarmaco,
              as: "medicamentoFormaFarmacos",
              required: false,
              where: {
                ativo: true,
              },
            },
          ],
          transaction,
        });

        const medicamentoCatalogo = medicamentosCatalogo.find((medicamento) => {
          const nomeCatalogo = medicamento.nome.trim().toLowerCase();

          return (
            nomeCatalogo === nomeDoacao ||
            nomeDoacao.includes(nomeCatalogo) ||
            nomeCatalogo.includes(nomeDoacao)
          );
        });

        medicamentoFormaFarmacoId =
          medicamentoCatalogo?.medicamentoFormaFarmacos?.[0]?.id ?? null;

        if (medicamentoFormaFarmacoId) {
          await medicamentoDoacao.update(
            {
              medicamentoFormaFarmacoId,
            },
            { transaction },
          );
        }
      }

      if (!medicamentoFormaFarmacoId || quantidade <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          message:
            "Medicamento da doação não foi encontrado no catálogo. Cadastre o medicamento ou selecione uma forma farmacêutica antes de aprovar.",
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
          status: "aprovada",
          aprovado: true,
          ativo: true,
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

      if (triagem.status === "aprovada" || triagem.aprovado) {
        await transaction.rollback();

        return res.status(409).json({
          message: "Não é possível reprovar uma triagem já aprovada.",
        });
      }

      if (triagem.status === "reprovada") {
        await transaction.rollback();

        return res.status(409).json({
          message: "Esta triagem já foi reprovada.",
        });
      }

      await triagem.update(
        {
          status: "reprovada",
          aprovado: false,
          ativo: true,
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
