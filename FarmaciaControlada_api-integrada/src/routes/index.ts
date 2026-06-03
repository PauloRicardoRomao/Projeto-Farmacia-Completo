import { Router } from "express";

import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";
import empresaRoutes from "./empresa.routes";
import medicamentoRoutes from "./medicamento.routes";
import estoqueMedicamentoRoutes from "./estoque-medicamento.routes";
import doacaoRoutes from "./doacao.routes";
import receitaRoutes from "./receita.routes";
import imagemRoutes from "./imagem.routes";

const routes = Router();

routes.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

routes.use("/auth", authRoutes);
routes.use("/usuarios", usuarioRoutes);
routes.use("/empresas", empresaRoutes);
routes.use("/medicamentos", medicamentoRoutes);
routes.use("/estoque-medicamentos", estoqueMedicamentoRoutes);
routes.use("/doacoes", doacaoRoutes);
routes.use("/receitas", receitaRoutes);
routes.use("/imagens", imagemRoutes);

export default routes;
