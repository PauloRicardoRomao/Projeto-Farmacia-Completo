import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Op } from "sequelize";

import Usuario from "../models/usuario.model";
import Empresa from "../models/empresa.model";
import UsuarioEmpresa from "../models/usuario-empresa.model";

type LoginUsuarioBody = {
  login: string;
  senha: string;
};

type LoginEmpresaBody = {
  cnpj: string;
  senha: string;
};

type TipoConta = "usuario" | "empresa";

type JwtPayloadBase = {
  sub: number;
  tipoConta: TipoConta;
};

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return secret;
}

function gerarToken(payload: JwtPayloadBase) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

function removerSenhaHash<T extends Record<string, unknown>>(data: T) {
  const { senhaHash, ...rest } = data;

  return rest;
}

class AuthController {
  async loginUsuario(req: Request<{}, {}, LoginUsuarioBody>, res: Response) {
    try {
      const { login, senha } = req.body;

      if (!login || !senha) {
        return res.status(400).json({
          message: "Login e senha são obrigatórios.",
        });
      }

      const loginTratado = login.trim();
      const cpfLimpo = loginTratado.replace(/\D/g, "");

      const usuario = await Usuario.findOne({
        where: {
          ativo: true,
          [Op.or]: [
            {
              email: loginTratado,
            },
            {
              cpf: cpfLimpo,
            },
          ],
        },
        include: [
          {
            model: UsuarioEmpresa,
            as: "usuariosEmpresas",
            required: false,
            where: {
              ativo: true,
            },
            include: [
              {
                model: Empresa,
                as: "empresa",
                attributes: {
                  exclude: ["senhaHash"],
                },
              },
            ],
          },
        ],
      });

      if (!usuario) {
        return res.status(401).json({
          message: "Credenciais inválidas.",
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

      if (!senhaValida) {
        return res.status(401).json({
          message: "Credenciais inválidas.",
        });
      }

      const token = gerarToken({
        sub: usuario.id,
        tipoConta: "usuario",
      });

      const usuarioSemSenha = removerSenhaHash(
        usuario.toJSON() as Record<string, unknown>,
      );

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        token,
        tipoConta: "usuario",
        usuario: usuarioSemSenha,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao realizar login do usuário.",
        console: console.log(error)
      });
    }
  }

  async loginEmpresa(req: Request<{}, {}, LoginEmpresaBody>, res: Response) {
    try {
      const { cnpj, senha } = req.body;

      if (!cnpj || !senha) {
        return res.status(400).json({
          message: "CNPJ e senha são obrigatórios.",
        });
      }

      const cnpjLimpo = cnpj.replace(/\D/g, "");

      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({
          message: "CNPJ inválido.",
        });
      }

      const empresa = await Empresa.findOne({
        where: {
          cnpj: cnpjLimpo,
          ativo: true,
        },
      });

      if (!empresa) {
        return res.status(401).json({
          message: "Credenciais inválidas.",
        });
      }

      const senhaValida = await bcrypt.compare(senha, empresa.senhaHash);

      if (!senhaValida) {
        return res.status(401).json({
          message: "Credenciais inválidas.",
        });
      }

      const token = gerarToken({
        sub: empresa.id,
        tipoConta: "empresa",
      });

      const empresaSemSenha = removerSenhaHash(
        empresa.toJSON() as Record<string, unknown>,
      );

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        token,
        tipoConta: "empresa",
        empresa: empresaSemSenha,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao realizar login da empresa.",
        error,
      });
    }
  }
}

export default new AuthController();
