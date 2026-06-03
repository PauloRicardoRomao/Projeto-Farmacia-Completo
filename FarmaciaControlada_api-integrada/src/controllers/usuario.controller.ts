import { Request, Response } from "express";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

import sequelize from "../config/config";
import Usuario from "../models/usuario.model";
import Empresa from "../models/empresa.model";
import UsuarioEmpresa from "../models/usuario-empresa.model";

type TipoUsuarioEmpresa = "admin" | "funcionario";

type CreateUsuarioBody = {
  nome?: string | null;
  email?: string | null;
  cpf?: string | null;
  senha: string;
  empresaId?: number | null;
  tipo?: TipoUsuarioEmpresa;
};

type UpdateUsuarioBody = {
  nome?: string | null;
  email?: string | null;
  cpf?: string | null;
  senha?: string;
  ativo?: boolean;
};

const usuarioInclude = [
  {
    model: UsuarioEmpresa,
    as: "usuariosEmpresas",
    required: false,
    where: { ativo: true },
    include: [
      {
        model: Empresa,
        as: "empresa",
        attributes: { exclude: ["senhaHash"] },
      },
    ],
  },
];

function validarId(valor: unknown) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function normalizarEmail(email?: string | null) {
  const emailNormalizado = email?.trim().toLowerCase();
  return emailNormalizado || null;
}

function normalizarCpf(cpf?: string | null) {
  const cpfLimpo = cpf?.replace(/\D/g, "");
  return cpfLimpo || null;
}

class UsuarioController {
  async create(req: Request<{}, {}, CreateUsuarioBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const { nome, email, cpf, senha, empresaId, tipo } = req.body;
      const emailNormalizado = normalizarEmail(email);
      const cpfLimpo = normalizarCpf(cpf);
      const empresaIdNumber = empresaId ? validarId(empresaId) : null;

      if (!senha) {
        await transaction.rollback();
        return res.status(400).json({ message: "A senha e obrigatoria." });
      }

      if (!emailNormalizado && !cpfLimpo) {
        await transaction.rollback();
        return res.status(400).json({ message: "Informe pelo menos email ou CPF." });
      }

      if (cpfLimpo && cpfLimpo.length !== 11) {
        await transaction.rollback();
        return res.status(400).json({ message: "CPF invalido." });
      }

      const filtrosDuplicidade = [];

      if (emailNormalizado) filtrosDuplicidade.push({ email: emailNormalizado });
      if (cpfLimpo) filtrosDuplicidade.push({ cpf: cpfLimpo });

      const usuarioExistente = await Usuario.findOne({
        where: { [Op.or]: filtrosDuplicidade },
        transaction,
      });

      if (usuarioExistente) {
        await transaction.rollback();
        return res.status(409).json({ message: "Ja existe um usuario cadastrado com este email ou CPF." });
      }

      if (empresaId && !empresaIdNumber) {
        await transaction.rollback();
        return res.status(400).json({ message: "empresaId invalido." });
      }

      if (empresaIdNumber) {
        const empresa = await Empresa.findOne({
          where: { id: empresaIdNumber, ativo: true },
          transaction,
        });

        if (!empresa) {
          await transaction.rollback();
          return res.status(404).json({ message: "Empresa nao encontrada." });
        }
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await Usuario.create(
        {
          nome: nome ?? null,
          email: emailNormalizado,
          cpf: cpfLimpo,
          senhaHash,
          ativo: true,
        },
        { transaction },
      );

      if (empresaIdNumber) {
        await UsuarioEmpresa.create(
          {
            usuarioId: usuario.id,
            empresaId: empresaIdNumber,
            tipo: tipo ?? "funcionario",
            ativo: true,
          },
          { transaction },
        );
      }

      const usuarioCriado = await Usuario.findByPk(usuario.id, {
        attributes: { exclude: ["senhaHash"] },
        include: usuarioInclude,
        transaction,
      });

      await transaction.commit();
      return res.status(201).json({ message: "Usuario cadastrado com sucesso.", usuario: usuarioCriado });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: "Erro ao cadastrar usuario.", error });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const usuarios = await Usuario.findAll({
        where: { ativo: true },
        attributes: { exclude: ["senhaHash"] },
        include: usuarioInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar usuarios.", error });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const usuarioId = validarId(req.params.id);

      if (!usuarioId) return res.status(400).json({ message: "ID invalido." });

      const usuario = await Usuario.findOne({
        where: { id: usuarioId, ativo: true },
        attributes: { exclude: ["senhaHash"] },
        include: usuarioInclude,
      });

      if (!usuario) return res.status(404).json({ message: "Usuario nao encontrado." });

      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar usuario.", error });
    }
  }

  async update(req: Request<{ id: string }, {}, UpdateUsuarioBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const usuarioId = validarId(req.params.id);
      const { nome, email, cpf, senha, ativo } = req.body;

      if (!usuarioId) {
        await transaction.rollback();
        return res.status(400).json({ message: "ID invalido." });
      }

      const usuario = await Usuario.findOne({ where: { id: usuarioId }, transaction });

      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({ message: "Usuario nao encontrado." });
      }

      const emailNormalizado = email !== undefined ? normalizarEmail(email) : usuario.email;
      const cpfLimpo = cpf !== undefined ? normalizarCpf(cpf) : usuario.cpf;

      if (cpfLimpo && cpfLimpo.length !== 11) {
        await transaction.rollback();
        return res.status(400).json({ message: "CPF invalido." });
      }

      const filtrosDuplicidade = [];
      if (emailNormalizado) filtrosDuplicidade.push({ email: emailNormalizado });
      if (cpfLimpo) filtrosDuplicidade.push({ cpf: cpfLimpo });

      if (filtrosDuplicidade.length > 0) {
        const usuarioExistente = await Usuario.findOne({
          where: {
            id: { [Op.ne]: usuarioId },
            [Op.or]: filtrosDuplicidade,
          },
          transaction,
        });

        if (usuarioExistente) {
          await transaction.rollback();
          return res.status(409).json({ message: "Ja existe outro usuario com este email ou CPF." });
        }
      }

      const senhaHash = senha ? await bcrypt.hash(senha, 10) : usuario.senhaHash;

      await usuario.update(
        {
          nome: nome !== undefined ? nome : usuario.nome,
          email: emailNormalizado,
          cpf: cpfLimpo,
          senhaHash,
          ativo: ativo ?? usuario.ativo,
        },
        { transaction },
      );

      const usuarioAtualizado = await Usuario.findByPk(usuario.id, {
        attributes: { exclude: ["senhaHash"] },
        include: usuarioInclude,
        transaction,
      });

      await transaction.commit();
      return res.status(200).json({ message: "Usuario atualizado com sucesso.", usuario: usuarioAtualizado });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: "Erro ao atualizar usuario.", error });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const usuarioId = validarId(req.params.id);

      if (!usuarioId) {
        await transaction.rollback();
        return res.status(400).json({ message: "ID invalido." });
      }

      const usuario = await Usuario.findOne({ where: { id: usuarioId, ativo: true }, transaction });

      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({ message: "Usuario nao encontrado." });
      }

      await usuario.update({ ativo: false }, { transaction });
      await transaction.commit();

      return res.status(200).json({ message: "Usuario removido com sucesso." });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: "Erro ao remover usuario.", error });
    }
  }
}

export default new UsuarioController();
