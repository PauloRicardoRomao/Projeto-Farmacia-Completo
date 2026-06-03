import multer from "multer";
import { Request } from "express";

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

export const uploadImagem = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
  ) => {
    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(
        new Error("Formato de imagem inválido. Use JPG, PNG ou WEBP."),
      );
    }

    return callback(null, true);
  },
});
