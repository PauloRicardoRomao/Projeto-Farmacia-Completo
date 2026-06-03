import "dotenv/config";

import sequelize from "./config";
import "../models";

async function syncDatabase() {
  try {
    console.log("Conectando ao banco de dados...");

    await sequelize.authenticate();

    console.log("Conexão estabelecida com sucesso.");
    console.log("Sincronizando tabelas...");

    await sequelize.sync({
      force: false,
      alter: false,
    });

    console.log("Tabelas sincronizadas com sucesso.");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao sincronizar banco de dados:", error);
    process.exit(1);
  }
}

syncDatabase();
