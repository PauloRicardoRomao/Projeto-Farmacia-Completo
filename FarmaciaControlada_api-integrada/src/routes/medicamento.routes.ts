import { Router } from "express";

import MedicamentoController from "../controllers/medicamento.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const medicamentoRoutes = Router();

medicamentoRoutes.use(authMiddleware);

medicamentoRoutes.post("/", MedicamentoController.create);
medicamentoRoutes.get("/", MedicamentoController.findAll);
medicamentoRoutes.get("/:id", MedicamentoController.findById);
medicamentoRoutes.put("/:id", MedicamentoController.update);
medicamentoRoutes.delete("/:id", MedicamentoController.delete);

export default medicamentoRoutes;
