import { Request, Response } from "express";

import Imagem from "../models/imagem.model";
import Usuario from "../models/usuario.model";
import ReceitaUsuario from "../models/receita-usuario.model";
import MedicamentoFormaFarmaco from "../models/medicamento-forma-farmaco.model";
import Medicamento from "../models/medicamento.model";
import FormaFarmacoMedicamento from "../models/forma-farmaco-medicamento.model";

type ImagemQuery = {
  tipo?: "perfil_usuario" | "receita_usuario" | "medicamento";
  usuarioId?: string;
  receitaUsuarioId?: string;
  medicamentoFormaFarmacoId?: string;
};

function validarId(valor: unknown) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function validarArquivo(file?: Express.Multer.File) {
  if (!file) {
    return "Imagem é obrigatória.";
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    return "Formato de imagem inválido. Use JPG, PNG ou WEBP.";
  }

  return null;
}

const imagemInclude = [
  {
    model: Usuario,
    as: "usuario",
    attributes: {
      exclude: ["senhaHash"],
    },
  },
  {
    model: ReceitaUsuario,
    as: "receitaUsuario",
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
];

class ImagemController {
  async salvarPerfilUsuario(
    req: Request<{ usuarioId: string }>,
    res: Response,
  ) {
    try {
      const usuarioId = validarId(req.params.usuarioId);
      const erroArquivo = validarArquivo(req.file);

      if (!usuarioId) {
        return res.status(400).json({
          message: "ID do usuário inválido.",
        });
      }

      if (erroArquivo) {
        return res.status(400).json({
          message: erroArquivo,
        });
      }

      const usuario = await Usuario.findOne({
        where: {
          id: usuarioId,
          ativo: true,
        },
      });

      if (!usuario) {
        return res.status(404).json({
          message: "Usuário não encontrado.",
        });
      }

      await Imagem.update(
        {
          ativo: false,
        },
        {
          where: {
            usuarioId,
            tipo: "perfil_usuario",
            ativo: true,
          },
        },
      );

      const imagem = await Imagem.create({
        tipo: "perfil_usuario",
        usuarioId,
        receitaUsuarioId: null,
        medicamentoFormaFarmacoId: null,
        nomeOriginal: req.file!.originalname,
        mimeType: req.file!.mimetype,
        tamanhoBytes: req.file!.size,
        dados: req.file!.buffer,
        ativo: true,
      });

      const imagemCriada = await Imagem.findByPk(imagem.id, {
        attributes: {
          exclude: ["dados"],
        },
        include: imagemInclude,
      });

      return res.status(201).json({
        message: "Foto de perfil salva com sucesso.",
        imagem: imagemCriada,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao salvar foto de perfil.",
        error,
      });
    }
  }

  async salvarReceita(
    req: Request<{ receitaUsuarioId: string }>,
    res: Response,
  ) {
    try {
      const receitaUsuarioId = validarId(req.params.receitaUsuarioId);
      const erroArquivo = validarArquivo(req.file);

      if (!receitaUsuarioId) {
        return res.status(400).json({
          message: "ID da receita inválido.",
        });
      }

      if (erroArquivo) {
        return res.status(400).json({
          message: erroArquivo,
        });
      }

      const receita = await ReceitaUsuario.findOne({
        where: {
          id: receitaUsuarioId,
          ativo: true,
        },
      });

      if (!receita) {
        return res.status(404).json({
          message: "Receita não encontrada.",
        });
      }

      const imagem = await Imagem.create({
        tipo: "receita_usuario",
        usuarioId: receita.usuarioId,
        receitaUsuarioId,
        medicamentoFormaFarmacoId: null,
        nomeOriginal: req.file!.originalname,
        mimeType: req.file!.mimetype,
        tamanhoBytes: req.file!.size,
        dados: req.file!.buffer,
        ativo: true,
      });

      const imagemCriada = await Imagem.findByPk(imagem.id, {
        attributes: {
          exclude: ["dados"],
        },
        include: imagemInclude,
      });

      return res.status(201).json({
        message: "Imagem da receita salva com sucesso.",
        imagem: imagemCriada,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao salvar imagem da receita.",
        error,
      });
    }
  }

  async salvarMedicamento(
    req: Request<{ medicamentoFormaFarmacoId: string }>,
    res: Response,
  ) {
    try {
      const medicamentoFormaFarmacoId = validarId(
        req.params.medicamentoFormaFarmacoId,
      );

      const erroArquivo = validarArquivo(req.file);

      if (!medicamentoFormaFarmacoId) {
        return res.status(400).json({
          message: "ID do medicamento/forma farmacêutica inválido.",
        });
      }

      if (erroArquivo) {
        return res.status(400).json({
          message: erroArquivo,
        });
      }

      const medicamentoFormaFarmaco = await MedicamentoFormaFarmaco.findOne({
        where: {
          id: medicamentoFormaFarmacoId,
          ativo: true,
        },
      });

      if (!medicamentoFormaFarmaco) {
        return res.status(404).json({
          message: "Medicamento/forma farmacêutica não encontrado.",
        });
      }

      const imagem = await Imagem.create({
        tipo: "medicamento",
        usuarioId: null,
        receitaUsuarioId: null,
        medicamentoFormaFarmacoId,
        nomeOriginal: req.file!.originalname,
        mimeType: req.file!.mimetype,
        tamanhoBytes: req.file!.size,
        dados: req.file!.buffer,
        ativo: true,
      });

      const imagemCriada = await Imagem.findByPk(imagem.id, {
        attributes: {
          exclude: ["dados"],
        },
        include: imagemInclude,
      });

      return res.status(201).json({
        message: "Imagem do medicamento salva com sucesso.",
        imagem: imagemCriada,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao salvar imagem do medicamento.",
        error,
      });
    }
  }

  async findAll(req: Request<{}, {}, {}, ImagemQuery>, res: Response) {
    try {
      const { tipo, usuarioId, receitaUsuarioId, medicamentoFormaFarmacoId } =
        req.query;

      const where: {
        ativo: boolean;
        tipo?: string;
        usuarioId?: number;
        receitaUsuarioId?: number;
        medicamentoFormaFarmacoId?: number;
      } = {
        ativo: true,
      };

      if (tipo) {
        where.tipo = tipo;
      }

      if (usuarioId) {
        const id = validarId(usuarioId);

        if (!id) {
          return res.status(400).json({
            message: "usuarioId inválido.",
          });
        }

        where.usuarioId = id;
      }

      if (receitaUsuarioId) {
        const id = validarId(receitaUsuarioId);

        if (!id) {
          return res.status(400).json({
            message: "receitaUsuarioId inválido.",
          });
        }

        where.receitaUsuarioId = id;
      }

      if (medicamentoFormaFarmacoId) {
        const id = validarId(medicamentoFormaFarmacoId);

        if (!id) {
          return res.status(400).json({
            message: "medicamentoFormaFarmacoId inválido.",
          });
        }

        where.medicamentoFormaFarmacoId = id;
      }

      const imagens = await Imagem.findAll({
        where,
        attributes: {
          exclude: ["dados"],
        },
        include: imagemInclude,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(imagens);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar imagens.",
        error,
      });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const id = validarId(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const imagem = await Imagem.findOne({
        where: {
          id,
          ativo: true,
        },
        attributes: {
          exclude: ["dados"],
        },
        include: imagemInclude,
      });

      if (!imagem) {
        return res.status(404).json({
          message: "Imagem não encontrada.",
        });
      }

      return res.status(200).json(imagem);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar imagem.",
        error,
      });
    }
  }

  async arquivo(req: Request<{ id: string }>, res: Response) {
    try {
      const id = validarId(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const imagem = await Imagem.findOne({
        where: {
          id,
          ativo: true,
        },
      });

      if (!imagem) {
        return res.status(404).json({
          message: "Imagem não encontrada.",
        });
      }

      res.setHeader("Content-Type", imagem.mimeType);
      res.setHeader("Content-Length", imagem.tamanhoBytes.toString());
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${imagem.nomeOriginal}"`,
      );

      return res.send(imagem.dados);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao carregar arquivo da imagem.",
        error,
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const id = validarId(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: "ID inválido.",
        });
      }

      const imagem = await Imagem.findOne({
        where: {
          id,
          ativo: true,
        },
      });

      if (!imagem) {
        return res.status(404).json({
          message: "Imagem não encontrada.",
        });
      }

      await imagem.update({
        ativo: false,
      });

      return res.status(200).json({
        message: "Imagem removida com sucesso.",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao remover imagem.",
        error,
      });
    }
  }
}

export default new ImagemController();
