import { Router } from "express";
import prisma from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { CREW_WRITE_ROLES } from "../constants/rbac";

const crewCertificationRouter = Router();

crewCertificationRouter.use(requireAuth);

crewCertificationRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const crewId = typeof req.query.crewId === "string" ? req.query.crewId : undefined;

    const data = await prisma.crewCertification.findMany({
      where: crewId ? { crewId } : undefined,
      orderBy: { issuedAt: "desc" },
      include: { crew: true },
    });

    res.json({ success: true, data });
  }),
);

crewCertificationRouter.post(
  "/",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const { crewId, certificationName, issuedBy, issuedAt, expiresAt, status, notes } = req.body as Record<string, unknown>;

    if (!crewId || !certificationName) {
      throw new HttpError(400, "crewId and certificationName are required");
    }

    const data = await prisma.crewCertification.create({
      data: {
        crewId: String(crewId),
        certificationName: String(certificationName),
        issuedBy: issuedBy ? String(issuedBy) : undefined,
        issuedAt: issuedAt ? new Date(String(issuedAt)) : new Date(),
        expiresAt: expiresAt ? new Date(String(expiresAt)) : undefined,
        status: typeof status === "string" ? (status as never) : undefined,
        notes: notes ? String(notes) : undefined,
      },
      include: { crew: true },
    });

    res.status(201).json({ success: true, data });
  }),
);

crewCertificationRouter.put(
  "/:id",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const certificationId = String(req.params.id);
    const payload = req.body as Record<string, unknown>;

    const data = await prisma.crewCertification.update({
      where: { id: certificationId },
      data: {
        ...payload,
        issuedAt: payload.issuedAt ? new Date(String(payload.issuedAt)) : undefined,
        expiresAt: payload.expiresAt ? new Date(String(payload.expiresAt)) : undefined,
      },
      include: { crew: true },
    });

    res.json({ success: true, data });
  }),
);

crewCertificationRouter.delete(
  "/:id",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    await prisma.crewCertification.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

export default crewCertificationRouter;
