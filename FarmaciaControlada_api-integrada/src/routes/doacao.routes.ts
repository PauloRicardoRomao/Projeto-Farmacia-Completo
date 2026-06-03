import { Router } from "express";

import DoacaoController from "../controllers/doacao.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const doacaoRoutes = Router();

doacaoRoutes.post("/", DoacaoController.create);
doacaoRoutes.get("/", authMiddleware, DoacaoController.findAll);
doacaoRoutes.get("/:id", authMiddleware, DoacaoController.findById);

doacaoRoutes.patch(
  "/triagens/:triagemId/aprovar",
  authMiddleware,
  DoacaoController.aprovarTriagem,
);

doacaoRoutes.patch(
  "/triagens/:triagemId/reprovar",
  authMiddleware,
  DoacaoController.reprovarTriagem,
);

doacaoRoutes.delete("/:id", authMiddleware, DoacaoController.delete);

export default doacaoRoutes;
