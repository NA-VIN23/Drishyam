import type { NextFunction, Request, Response } from "express";
import prisma from "../config/db";
import { HttpError } from "../utils/httpError";
import { verifyToken } from "../utils/jwt";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing authorization token");
    }

    const token = header.slice(7);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    if (user.status !== "ACTIVE") {
      throw new HttpError(403, "User account is not active");
    }

    req.auth = payload;
    req.currentUser = user;

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.currentUser.role.key)) {
      next(new HttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}