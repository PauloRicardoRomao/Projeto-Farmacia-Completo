import { Router } from "express";

import UsuarioController from "../controllers/usuario.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const usuarioRoutes = Router();

usuarioRoutes.post("/", UsuarioController.create);
usuarioRoutes.get("/", authMiddleware, UsuarioController.findAll);
usuarioRoutes.get("/:id", authMiddleware, UsuarioController.findById);
usuarioRoutes.put("/:id", authMiddleware, UsuarioController.update);
usuarioRoutes.delete("/:id", authMiddleware, UsuarioController.delete);

export default usuarioRoutes;
