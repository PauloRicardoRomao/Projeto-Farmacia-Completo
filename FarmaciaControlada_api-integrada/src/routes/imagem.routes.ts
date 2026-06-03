import { Router } from "express";

import ImagemController from "../controllers/imagem.controller";
import { uploadImagem } from "../middlewares/upload-imagem.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const imagemRoutes = Router();

imagemRoutes.use(authMiddleware);

imagemRoutes.post(
  "/perfil/usuarios/:usuarioId",
  uploadImagem.single("imagem"),
  ImagemController.salvarPerfilUsuario,
);

imagemRoutes.post(
  "/receitas/:receitaUsuarioId",
  uploadImagem.single("imagem"),
  ImagemController.salvarReceita,
);

imagemRoutes.post(
  "/medicamentos-forma/:medicamentoFormaFarmacoId",
  uploadImagem.single("imagem"),
  ImagemController.salvarMedicamento,
);

imagemRoutes.get("/", ImagemController.findAll);
imagemRoutes.get("/:id/arquivo", ImagemController.arquivo);
imagemRoutes.get("/:id", ImagemController.findById);
imagemRoutes.delete("/:id", ImagemController.delete);

export default imagemRoutes;
