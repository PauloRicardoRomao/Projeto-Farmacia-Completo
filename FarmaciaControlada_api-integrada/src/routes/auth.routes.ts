import { Router } from "express";

import AuthController from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/usuario/login", AuthController.loginUsuario);
authRoutes.post("/empresa/login", AuthController.loginEmpresa);

export default authRoutes;
