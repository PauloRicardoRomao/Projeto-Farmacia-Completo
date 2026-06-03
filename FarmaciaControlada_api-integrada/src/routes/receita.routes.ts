import { Router } from "express";

import ReceitaController from "../controllers/receita.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const receitaRoutes = Router();

receitaRoutes.use(authMiddleware);

receitaRoutes.post("/", ReceitaController.create);
receitaRoutes.get("/", ReceitaController.findAll);
receitaRoutes.get("/:id", ReceitaController.findById);
receitaRoutes.put("/:id", ReceitaController.update);
receitaRoutes.post("/:id/dispensar", ReceitaController.dispensar);
receitaRoutes.delete("/:id", ReceitaController.delete);

export default receitaRoutes;
