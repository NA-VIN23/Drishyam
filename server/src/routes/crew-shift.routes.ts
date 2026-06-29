import { Router } from "express";
import prisma from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { CREW_WRITE_ROLES } from "../constants/rbac";

const crewShiftRouter = Router();

crewShiftRouter.use(requireAuth);

crewShiftRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const crewId = typeof req.query.crewId === "string" ? req.query.crewId : undefined;

    const data = await prisma.crewShift.findMany({
      where: crewId ? { crewId } : undefined,
      orderBy: { shiftDate: "desc" },
      include: { crew: true },
    });

    res.json({ success: true, data });
  }),
);

crewShiftRouter.post(
  "/",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const { crewId, shiftDate, shiftStart, shiftEnd, shiftRole, location, notes, status } = req.body as Record<string, unknown>;

    if (!crewId || !shiftDate || !shiftStart || !shiftEnd) {
      throw new HttpError(400, "crewId, shiftDate, shiftStart, and shiftEnd are required");
    }

    const data = await prisma.crewShift.create({
      data: {
        crewId: String(crewId),
        shiftDate: new Date(String(shiftDate)),
        shiftStart: String(shiftStart),
        shiftEnd: String(shiftEnd),
        shiftRole: shiftRole ? String(shiftRole) : undefined,
        location: location ? String(location) : undefined,
        notes: notes ? String(notes) : undefined,
        status: typeof status === "string" ? (status as never) : undefined,
      },
      include: { crew: true },
    });

    res.status(201).json({ success: true, data });
  }),
);

crewShiftRouter.put(
  "/:id",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const shiftId = String(req.params.id);
    const payload = req.body as Record<string, unknown>;

    const data = await prisma.crewShift.update({
      where: { id: shiftId },
      data: {
        ...payload,
        shiftDate: payload.shiftDate ? new Date(String(payload.shiftDate)) : undefined,
      },
      include: { crew: true },
    });

    res.json({ success: true, data });
  }),
);

crewShiftRouter.delete(
  "/:id",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    await prisma.crewShift.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

export default crewShiftRouter;
