import { Router } from "express";
import prisma from "../config/db";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

const snagRouter = Router();

snagRouter.use(requireAuth);

snagRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await prisma.snag.findMany({
      orderBy: { detectedAt: "desc" },
      include: { aircraft: true, history: true, reportedByUser: true, reportedByCrew: true, assignedCrew: true },
    });

    res.json({ success: true, data });
  }),
);

snagRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { snagNumber, title, description, severity, status, aircraftId, reportedByCrewId, assignedCrewId } =
      req.body as Record<string, unknown>;

    if (!snagNumber || !title || !aircraftId) {
      throw new HttpError(400, "snagNumber, title, and aircraftId are required");
    }

    const data = await prisma.snag.create({
      data: {
        snagNumber: String(snagNumber),
        title: String(title),
        description: description ? String(description) : undefined,
        severity: typeof severity === "string" ? (severity as never) : undefined,
        status: typeof status === "string" ? (status as never) : undefined,
        aircraftId: String(aircraftId),
        reportedByUserId: req.currentUser?.id,
        reportedByCrewId: reportedByCrewId ? String(reportedByCrewId) : undefined,
        assignedCrewId: assignedCrewId ? String(assignedCrewId) : undefined,
        history: {
          create: {
            toStatus: typeof status === "string" ? (status as never) : "OPEN",
            changedById: req.currentUser?.id,
            note: "Snag created",
          },
        },
      },
      include: { history: true },
    });

    res.status(201).json({ success: true, data });
  }),
);

snagRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const snagId = String(req.params.id);

    const existing = await prisma.snag.findUnique({ where: { id: snagId } });

    if (!existing) {
      throw new HttpError(404, "Snag not found");
    }

    const updated = await prisma.snag.update({
      where: { id: snagId },
      data: req.body,
    });

    const newStatus = typeof req.body.status === "string" ? req.body.status : undefined;
    if (newStatus && newStatus !== existing.status) {
      await prisma.snagHistory.create({
        data: {
          snagId: existing.id,
          fromStatus: existing.status,
          toStatus: newStatus as never,
          changedById: req.currentUser?.id,
          note: "Status updated",
        },
      });
    }

    res.json({ success: true, data: updated });
  }),
);

snagRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.snag.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

export default snagRouter;