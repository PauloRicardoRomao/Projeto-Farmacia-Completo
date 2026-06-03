import { Router } from "express";

import EmpresaController from "../controllers/empresa.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const empresaRoutes = Router();

empresaRoutes.post("/", EmpresaController.create);
empresaRoutes.get("/", authMiddleware, EmpresaController.findAll);
empresaRoutes.get("/:id", authMiddleware, EmpresaController.findById);
empresaRoutes.put("/:id", authMiddleware, EmpresaController.update);
empresaRoutes.delete("/:id", authMiddleware, EmpresaController.delete);

export default empresaRoutes;
