import "dotenv/config";

import app from "./app";
import sequelize from "./config/config";
import "./models";

const PORT = process.env.PORT ?? 3333;

async function startServer() {
  try {
    await sequelize.authenticate();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
  }
}

startServer();
