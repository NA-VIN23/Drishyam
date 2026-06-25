import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { requireAuth } from "../middleware/auth";
import { signToken } from "../utils/jwt";
import { CORE_ROLE_KEYS } from "../constants/rbac";

const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, role, roleKey } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      roleKey?: string;
    };
    const requestedRoleKey = (roleKey ?? role ?? "TECHNICIAN").toString().toUpperCase();

    if (!name || !email || !password) {
      throw new HttpError(400, "name, email, and password are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, "Email already exists");
    }

    if (!CORE_ROLE_KEYS.includes(requestedRoleKey as typeof CORE_ROLE_KEYS[number])) {
      throw new HttpError(400, `Invalid roleKey: ${requestedRoleKey}`);
    }

    const roleRecord = await prisma.role.findUnique({ where: { key: requestedRoleKey } });
    if (!roleRecord) {
      throw new HttpError(400, `Invalid roleKey: ${requestedRoleKey}`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: roleRecord.id,
      },
      include: { role: true },
    });

    const token = signToken({
      userId: user.id,
      roleId: user.roleId,
      roleKey: user.role.key,
      email: user.email,
    });

    res.status(201).json({ success: true, data: { user, token } });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new HttpError(400, "email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      include: { role: true },
    });

    const token = signToken({
      userId: updatedUser.id,
      roleId: updatedUser.roleId,
      roleKey: updatedUser.role.key,
      email: updatedUser.email,
    });

    res.json({ success: true, data: { user: updatedUser, token } });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.currentUser });
  }),
);

export default authRouter;