import { Router } from "express";
import prisma from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { POLICY_WRITE_ROLES } from "../constants/rbac";

const policyRouter = Router();

policyRouter.use(requireAuth);

policyRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await prisma.policy.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, data });
  }),
);

policyRouter.post(
  "/",
  requireRole(...POLICY_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const { title, version, description, fileUrl, fileName, visibility, isPublished } = req.body as Record<string, unknown>;

    if (!title) {
      throw new HttpError(400, "title is required");
    }

    const data = await prisma.policy.create({
      data: {
        title: String(title),
        version: version ? String(version) : "1.0",
        description: description ? String(description) : undefined,
        fileUrl: fileUrl ? String(fileUrl) : undefined,
        fileName: fileName ? String(fileName) : undefined,
        visibility: typeof visibility === "string" ? (visibility as never) : undefined,
        isPublished: typeof isPublished === "boolean" ? isPublished : false,
      },
    });

    res.status(201).json({ success: true, data });
  }),
);

policyRouter.put(
  "/:id",
  requireRole(...POLICY_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const policyId = String(req.params.id);

    const data = await prisma.policy.update({
      where: { id: policyId },
      data: req.body,
    });

    res.json({ success: true, data });
  }),
);

policyRouter.delete(
  "/:id",
  requireRole(...POLICY_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    await prisma.policy.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

export default policyRouter;