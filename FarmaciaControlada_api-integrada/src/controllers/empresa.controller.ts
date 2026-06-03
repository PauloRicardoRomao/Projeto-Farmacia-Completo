import { Request, Response } from "express";
import bcrypt from "bcrypt";

import sequelize from "../config/config";
import Empresa from "../models/empresa.model";
import EnderecoEmpresa from "../models/endereco-empresa.model";
import UsuarioEmpresa from "../models/usuario-empresa.model";
import Usuario from "../models/usuario.model";

type EnderecoEmpresaInput = {
  endereco: string;
  bairro: string;
  numero: number;
  cidade: string;
  estado: string;
};

type CreateEmpresaBody = {
  cnpj: string;
  razaoSocial: string;
  senha: string;
  endereco?: EnderecoEmpresaInput;
};

type UpdateEmpresaBody = {
  cnpj?: string;
  razaoSocial?: string;
  senha?: string;
  endereco?: EnderecoEmpresaInput;
  ativo?: boolean;
};

const empresaInclude = [
  {
    model: EnderecoEmpresa,
    as: "enderecos",
    required: false,
    where: { ativo: true },
  },
  {
    model: UsuarioEmpresa,
    as: "usuariosEmpresas",
    required: false,
    where: { ativo: true },
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: { exclude: ["senhaHash"] },
      },
    ],
  },
];

function validarId(valor: unknown) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function normalizarCnpj(cnpj?: string) {
  return cnpj?.replace(/\D/g, "") ?? "";
}

class EmpresaController {
  async create(req: Request<{}, {}, CreateEmpresaBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const { cnpj, razaoSocial, senha, endereco } = req.body;

      if (!cnpj || !razaoSocial || !senha) {
        await transaction.rollback();
        return res.status(400).json({ message: "CNPJ, razao social e senha sao obrigatorios." });
      }

      const cnpjLimpo = normalizarCnpj(cnpj);

      if (cnpjLimpo.length !== 14) {
        await transaction.rollback();
        return res.status(400).json({ message: "CNPJ invalido." });
      }

      const empresaExistente = await Empresa.findOne({ where: { cnpj: cnpjLimpo }, transaction });

      if (empresaExistente) {
        await transaction.rollback();
        return res.status(409).json({ message: "Ja existe uma empresa cadastrada com este CNPJ." });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const empresa = await Empresa.create(
        { cnpj: cnpjLimpo, razaoSocial, senhaHash, ativo: true },
        { transaction },
      );

      if (endereco) {
        await EnderecoEmpresa.create(
          {
            empresaId: empresa.id,
            endereco: endereco.endereco,
            bairro: endereco.bairro,
            numero: endereco.numero,
            cidade: endereco.cidade,
            estado: endereco.estado.toUpperCase(),
            ativo: true,
          },
          { transaction },
        );
      }

      const empresaCriada = await Empresa.findByPk(empresa.id, {
        attributes: { exclude: ["senhaHash"] },
        include: empresaInclude,
        transaction,
      });

      await transaction.commit();
      return res.status(201).json({ message: "Empresa cadastrada com sucesso.", empresa: empresaCriada });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: "Erro ao cadastrar empresa.", error });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const empresas = await Empresa.findAll({
        where: { ativo: true },
        attributes: { exclude: ["senhaHash"] },
        include: empresaInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(empresas);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar empresas.", error });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const empresaId = validarId(req.params.id);

      if (!empresaId) return res.status(400).json({ message: "ID invalido." });

      const empresa = await Empresa.findOne({
        where: { id: empresaId, ativo: true },
        attributes: { exclude: ["senhaHash"] },
        include: empresaInclude,
      });

      if (!empresa) return res.status(404).json({ message: "Empresa nao encontrada." });

      return res.status(200).json(empresa);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar empresa.", error });
    }
  }

  async update(req: Request<{ id: string }, {}, UpdateEmpresaBody>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const empresaId = validarId(req.params.id);
      const { cnpj, razaoSocial, senha, endereco, ativo } = req.body;

      if (!empresaId) {
        await transaction.rollback();
        return res.status(400).json({ message: "ID invalido." });
      }

      const empresa = await Empresa.findOne({ where: { id: empresaId }, transaction });

      if (!empresa) {
        await transaction.rollback();
        return res.status(404).json({ message: "Empresa nao encontrada." });
      }

      const cnpjLimpo = cnpj !== undefined ? normalizarCnpj(cnpj) : empresa.cnpj;

      if (cnpj !== undefined && cnpjLimpo.length !== 14) {
        await transaction.rollback();
        return res.status(400).json({ message: "CNPJ invalido." });
      }

      if (cnpjLimpo !== empresa.cnpj) {
        const empresaExistente = await Empresa.findOne({ where: { cnpj: cnpjLimpo }, transaction });

        if (empresaExistente && empresaExistente.id !== empresa.id) {
          await transaction.rollback();
          return res.status(409).json({ message: "Ja existe outra empresa com este CNPJ." });
        }
      }

      const senhaHash = senha ? await bcrypt.hash(senha, 10) : empresa.senhaHash;

      await empresa.update(
        {
          cnpj: cnpjLimpo,
          razaoSocial: razaoSocial ?? empresa.razaoSocial,
          senhaHash,
          ativo: ativo ?? empresa.ativo,
        },
        { transaction },
      );

      if (endereco) {
        const enderecoAtual = await EnderecoEmpresa.findOne({
          where: { empresaId: empresa.id, ativo: true },
          transaction,
        });

        const dadosEndereco = {
          empresaId: empresa.id,
          endereco: endereco.endereco,
          bairro: endereco.bairro,
          numero: endereco.numero,
          cidade: endereco.cidade,
          estado: endereco.estado.toUpperCase(),
          ativo: true,
        };

        if (enderecoAtual) {
          await enderecoAtual.update(dadosEndereco, { transaction });
        } else {
          await EnderecoEmpresa.create(dadosEndereco, { transaction });
        }
      }

      const empresaAtualizada = await Empresa.findByPk(empresa.id, {
        attributes: { exclude: ["senhaHash"] },
        include: empresaInclude,
        transaction,
      });

      await transaction.commit();
      return res.status(200).json({ message: "Empresa atualizada com sucesso.", empresa: empresaAtualizada });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: "Erro ao atualizar empresa.", error });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const empresaId = validarId(req.params.id);

      if (!empresaId) {
        await transaction.rollback();
        return res.status(400).json({ message: "ID invalido." });
      }

      const empresa = await Empresa.findOne({ where: { id: empresaId, ativo: true }, transaction });

      if (!empresa) {
        await transaction.rollback();
        return res.status(404).json({ message: "Empresa nao encontrada." });
      }

      await empresa.update({ ativo: false }, { transaction });
      await transaction.commit();

      return res.status(200).json({ message: "Empresa removida com sucesso." });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: "Erro ao remover empresa.", error });
    }
  }
}

export default new EmpresaController();
