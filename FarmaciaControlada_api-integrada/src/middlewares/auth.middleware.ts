import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export type TipoConta = "usuario" | "empresa";

export type AuthPayload = {
  sub: number;
  tipoConta: TipoConta;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthPayload;
};

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return secret;
}

function isAuthPayload(
  decoded: string | JwtPayload,
): decoded is JwtPayload & { sub: string | number; tipoConta: TipoConta } {
  if (typeof decoded === "string") {
    return false;
  }

  return (
    decoded.sub !== undefined &&
    (decoded.tipoConta === "usuario" || decoded.tipoConta === "empresa")
  );
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token não informado.",
      });
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Formato do token inválido.",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (!isAuthPayload(decoded)) {
      return res.status(401).json({
        message: "Token inválido.",
      });
    }

    req.auth = {
      sub: Number(decoded.sub),
      tipoConta: decoded.tipoConta,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}

export function somenteUsuario(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.auth?.tipoConta !== "usuario") {
    return res.status(403).json({
      message: "Acesso permitido apenas para usuários.",
    });
  }

  return next();
}

export function somenteEmpresa(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.auth?.tipoConta !== "empresa") {
    return res.status(403).json({
      message: "Acesso permitido apenas para empresas.",
    });
  }

  return next();
}
