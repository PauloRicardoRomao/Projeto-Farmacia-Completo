import { Request, Response } from "express";
import { Includeable, Op } from "sequelize";

import sequelize from "../config/config";

import Medicamento from "../models/medicamento.model";
import ClasseFarmacologicaMedicamento from "../models/classe-farmacologica-medicamento.model";
import TarjaMedicamento from "../models/tarja-medicamento.model";
import FormaFarmacoMedicamento from "../models/forma-farmaco-medicamento.model";
import MedicamentoFormaFarmaco from "../models/medicamento-forma-farmaco.model";
import UsoTerapeuticoMedicamento from "../models/uso-terapeutico-medicamento.model";
import MedicamentoUsoTerapeutico from "../models/medicamento-uso-terapeutico.model";

type CreateMedicamentoBody = {
  nome: string;
  descricao: string;
  classeId: number;
  tarjaId: number;
  formaFarmacoIds: number[];
  usoTerapeuticoIds?: number[];
};

type UpdateMedicamentoBody = {
  nome?: string;
  descricao?: string;
  classeId?: number;
  tarjaId?: number;
  formaFarmacoIds?: number[];
  usoTerapeuticoIds?: number[];
};

type MedicamentoQuery = {
  nome?: string;
  classeId?: string;
  tarjaId?: string;
};

const medicamentoInclude: Includeable[] = [
  {
    model: ClasseFarmacologicaMedicamento,
    as: "classeFarmacologica",
  },
  {
    model: TarjaMedicamento,
    as: "tarjaMedicamento",
  },
  {
    model: MedicamentoFormaFarmaco,
    as: "medicamentoFormaFarmacos",
    required: false,
    where: {
      ativo: true,
    },
    include: [
      {
        model: FormaFarmacoMedicamento,
        as: "formaFarmaco",
      },
    ],
  },
  {
    model: UsoTerapeuticoMedicamento,
    as: "usosTerapeuticos",
    required: false,
    through: {
      attributes: [],
      where: {
        ativo: true,
      },
    },
  },
];

function normalizarIds(ids: number[] = []) {
  return [...new Set(ids.map(Number))].filter((id) => !Number.isNaN(id));
}

class MedicamentoController {
  async create(req: Request<{}, {}, CreateMedicamentoBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const {
        nome,
        descricao,
        classeId,
        tarjaId,
        formaFarmacoIds,
        usoTerapeuticoIds = [],
      } = req.body;

      if (!nome || !descricao || !classeId || !tarjaId) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Nome, descrição, classe e tarja são obrigatórios.",
        });
      }

      if (!formaFarmacoIds || formaFarmacoIds.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Informe pelo menos uma forma farmacêutica.",
        });
      }

      const formasIdsUnicos = normalizarIds(formaFarmacoIds);
      const usosIdsUnicos = normalizarIds(usoTerapeuticoIds);

      if (formasIdsUnicos.length !== formaFarmacoIds.length) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Lista de formas farmacêuticas inválida.",
        });
      }

      const classe = await ClasseFarmacologicaMedicamento.findOne({
        where: {
          id: classeId,
          ativo: true,
        },
        transaction,
      });

      if (!classe) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Classe farmacológica não encontrada.",
        });
      }

      const tarja = await TarjaMedicamento.findOne({
        where: {
          id: tarjaId,
          ativo: true,
        },
        transaction,
      });

      if (!tarja) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Tarja não encontrada.",
        });
      }

      const medicamentoExistente = await Medicamento.findOne({
        where: {
          nome,
          ativo: true,
        },
        transaction,
      });

      if (medicamentoExistente) {
        await transaction.rollback();

        return res.status(409).json({
          message: "Já existe um medicamento ativo com este nome.",
        });
      }

      const formasEncontradas = await FormaFarmacoMedicamento.count({
        where: {
          id: {
            [Op.in]: formasIdsUnicos,
          },
          ativo: true,
        },
        transaction,
      });

      if (formasEncontradas !== formasIdsUnicos.length) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Uma ou mais formas farmacêuticas não foram encontradas.",
        });
      }

      if (usosIdsUnicos.length > 0) {
        const usosEncontrados = await UsoTerapeuticoMedicamento.count({
          where: {
            id: {
              [Op.in]: usosIdsUnicos,
            },
            ativo: true,
          },
          transaction,
        });

        if (usosEncontrados !== usosIdsUnicos.length) {
          await transaction.rollback();

          return res.status(404).json({
            message: "Um ou mais usos terapêuticos não foram encontrados.",
          });
        }
      }

      const medicamento = await Medicamento.create(
        {
          nome,
          descricao,
          classeId,
          tarjaId,
          ativo: true,
        },
        { transaction },
      );

      const formasMedicamento = formasIdsUnicos.map((formaFarmacoId) => ({
        medicamentoId: medicamento.id,
        formaFarmacoId,
        ativo: true,
      }));

      await MedicamentoFormaFarmaco.bulkCreate(formasMedicamento, {
        transaction,
      });

      if (usosIdsUnicos.length > 0) {
        const usosMedicamento = usosIdsUnicos.map((usoTerapeuticoId) => ({
          medicamentoId: medicamento.id,
          usoTerapeuticoId,
          ativo: true,
        }));

        await MedicamentoUsoTerapeutico.bulkCreate(usosMedicamento, {
          transaction,
        });
      }

      const medicamentoCriado = await Medicamento.findByPk(medicamento.id, {
        include: medicamentoInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(201).json({
        message: "Medicamento cadastrado com sucesso.",
        medicamento: medicamentoCriado,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao cadastrar medicamento.",
        error,
      });
    }
  }

  async findAll(req: Request<{}, {}, {}, MedicamentoQuery>, res: Response) {
    try {
      const { nome, classeId, tarjaId } = req.query;

      const where: any = {
        ativo: true,
      };

      if (nome) {
        where.nome = {
          [Op.like]: `%${nome}%`,
        };
      }

      if (classeId) {
        const classeIdNumber = Number(classeId);

        if (Number.isNaN(classeIdNumber)) {
          return res.status(400).json({
            message: "classeId inválido.",
          });
        }

        where.classeId = classeIdNumber;
      }

      if (tarjaId) {
        const tarjaIdNumber = Number(tarjaId);

        if (Number.isNaN(tarjaIdNumber)) {
          return res.status(400).json({
            message: "tarjaId inválido.",
          });
        }

        where.tarjaId = tarjaIdNumber;
      }

      const medicamentos = await Medicamento.findAll({
        where,
        include: medicamentoInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(medicamentos);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar medicamentos.",
        error,
      });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const medicamentoId = Number(id);

      if (Number.isNaN(medicamentoId)) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const medicamento = await Medicamento.findOne({
        where: {
          id: medicamentoId,
          ativo: true,
        },
        include: medicamentoInclude,
      });

      if (!medicamento) {
        return res.status(404).json({
          message: "Medicamento não encontrado.",
        });
      }

      return res.status(200).json(medicamento);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar medicamento.",
        error,
      });
    }
  }

  async update(
    req: Request<{ id: string }, {}, UpdateMedicamentoBody>,
    res: Response,
  ) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const medicamentoId = Number(id);

      if (Number.isNaN(medicamentoId)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const {
        nome,
        descricao,
        classeId,
        tarjaId,
        formaFarmacoIds,
        usoTerapeuticoIds,
      } = req.body;

      const medicamento = await Medicamento.findOne({
        where: {
          id: medicamentoId,
          ativo: true,
        },
        transaction,
      });

      if (!medicamento) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Medicamento não encontrado.",
        });
      }

      if (classeId) {
        const classe = await ClasseFarmacologicaMedicamento.findOne({
          where: {
            id: classeId,
            ativo: true,
          },
          transaction,
        });

        if (!classe) {
          await transaction.rollback();

          return res.status(404).json({
            message: "Classe farmacológica não encontrada.",
          });
        }
      }

      if (tarjaId) {
        const tarja = await TarjaMedicamento.findOne({
          where: {
            id: tarjaId,
            ativo: true,
          },
          transaction,
        });

        if (!tarja) {
          await transaction.rollback();

          return res.status(404).json({
            message: "Tarja não encontrada.",
          });
        }
      }

      if (nome && nome !== medicamento.nome) {
        const medicamentoExistente = await Medicamento.findOne({
          where: {
            nome,
            ativo: true,
            id: {
              [Op.ne]: medicamentoId,
            },
          },
          transaction,
        });

        if (medicamentoExistente) {
          await transaction.rollback();

          return res.status(409).json({
            message: "Já existe outro medicamento ativo com este nome.",
          });
        }
      }

      await medicamento.update(
        {
          nome: nome ?? medicamento.nome,
          descricao: descricao ?? medicamento.descricao,
          classeId: classeId ?? medicamento.classeId,
          tarjaId: tarjaId ?? medicamento.tarjaId,
        },
        { transaction },
      );

      if (formaFarmacoIds !== undefined) {
        if (formaFarmacoIds.length === 0) {
          await transaction.rollback();

          return res.status(400).json({
            message:
              "O medicamento precisa ter pelo menos uma forma farmacêutica.",
          });
        }

        const formasIdsUnicos = normalizarIds(formaFarmacoIds);

        if (formasIdsUnicos.length !== formaFarmacoIds.length) {
          await transaction.rollback();

          return res.status(400).json({
            message: "Lista de formas farmacêuticas inválida.",
          });
        }

        const formasEncontradas = await FormaFarmacoMedicamento.count({
          where: {
            id: {
              [Op.in]: formasIdsUnicos,
            },
            ativo: true,
          },
          transaction,
        });

        if (formasEncontradas !== formasIdsUnicos.length) {
          await transaction.rollback();

          return res.status(404).json({
            message: "Uma ou mais formas farmacêuticas não foram encontradas.",
          });
        }

        await MedicamentoFormaFarmaco.update(
          {
            ativo: false,
          },
          {
            where: {
              medicamentoId,
            },
            transaction,
          },
        );

        const novasFormas = formasIdsUnicos.map((formaFarmacoId) => ({
          medicamentoId,
          formaFarmacoId,
          ativo: true,
        }));

        await MedicamentoFormaFarmaco.bulkCreate(novasFormas, {
          transaction,
        });
      }

      if (usoTerapeuticoIds !== undefined) {
        const usosIdsUnicos = normalizarIds(usoTerapeuticoIds);

        if (usosIdsUnicos.length !== usoTerapeuticoIds.length) {
          await transaction.rollback();

          return res.status(400).json({
            message: "Lista de usos terapêuticos inválida.",
          });
        }

        if (usosIdsUnicos.length > 0) {
          const usosEncontrados = await UsoTerapeuticoMedicamento.count({
            where: {
              id: {
                [Op.in]: usosIdsUnicos,
              },
              ativo: true,
            },
            transaction,
          });

          if (usosEncontrados !== usosIdsUnicos.length) {
            await transaction.rollback();

            return res.status(404).json({
              message: "Um ou mais usos terapêuticos não foram encontrados.",
            });
          }
        }

        await MedicamentoUsoTerapeutico.update(
          {
            ativo: false,
          },
          {
            where: {
              medicamentoId,
            },
            transaction,
          },
        );

        if (usosIdsUnicos.length > 0) {
          const novosUsos = usosIdsUnicos.map((usoTerapeuticoId) => ({
            medicamentoId,
            usoTerapeuticoId,
            ativo: true,
          }));

          await MedicamentoUsoTerapeutico.bulkCreate(novosUsos, {
            transaction,
          });
        }
      }

      const medicamentoAtualizado = await Medicamento.findByPk(medicamentoId, {
        include: medicamentoInclude,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        message: "Medicamento atualizado com sucesso.",
        medicamento: medicamentoAtualizado,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao atualizar medicamento.",
        error,
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const medicamentoId = Number(id);

      if (Number.isNaN(medicamentoId)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const medicamento = await Medicamento.findOne({
        where: {
          id: medicamentoId,
          ativo: true,
        },
        transaction,
      });

      if (!medicamento) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Medicamento não encontrado.",
        });
      }

      await MedicamentoFormaFarmaco.update(
        {
          ativo: false,
        },
        {
          where: {
            medicamentoId,
          },
          transaction,
        },
      );

      await MedicamentoUsoTerapeutico.update(
        {
          ativo: false,
        },
        {
          where: {
            medicamentoId,
          },
          transaction,
        },
      );

      medicamento.ativo = false;
      await medicamento.save({ transaction });

      await transaction.commit();

      return res.status(200).json({
        message: "Medicamento removido com sucesso.",
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(500).json({
        message: "Erro ao remover medicamento.",
        error,
      });
    }
  }
}

export default new MedicamentoController();
