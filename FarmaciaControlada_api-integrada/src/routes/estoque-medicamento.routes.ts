import { Router } from "express";

import EstoqueMedicamentoController from "../controllers/estoque-medicamento.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const estoqueMedicamentoRoutes = Router();

estoqueMedicamentoRoutes.use(authMiddleware);

estoqueMedicamentoRoutes.post(
  "/movimentar",
  EstoqueMedicamentoController.movimentar,
);

estoqueMedicamentoRoutes.get("/", EstoqueMedicamentoController.findAll);

estoqueMedicamentoRoutes.get(
  "/empresa/:empresaId",
  EstoqueMedicamentoController.findByEmpresa,
);

estoqueMedicamentoRoutes.get("/:id", EstoqueMedicamentoController.findById);

estoqueMedicamentoRoutes.patch(
  "/:id/configuracao",
  EstoqueMedicamentoController.atualizarConfiguracao,
);

estoqueMedicamentoRoutes.delete("/:id", EstoqueMedicamentoController.delete);

export default estoqueMedicamentoRoutes;
