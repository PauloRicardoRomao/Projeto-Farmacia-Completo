import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import routes from "./routes";
import "./models";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);

app.use((req: Request, res: Response) => {
  return res.status(404).json({
    message: "Rota não encontrada.",
  });
});

app.use(
  (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: "Erro no upload do arquivo.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
      error: error.message,
    });
  },
);

export default app;
