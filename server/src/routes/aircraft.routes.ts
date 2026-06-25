import { Router } from "express";
import prisma from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { AIRCRAFT_WRITE_ROLES } from "../constants/rbac";

const aircraftRouter = Router();

aircraftRouter.use(requireAuth);

aircraftRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await prisma.aircraft.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, data });
  }),
);

aircraftRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const aircraftId = String(req.params.id);

    const aircraft = await prisma.aircraft.findUnique({
      where: { id: aircraftId },
      include: { flightLogs: true, maintenanceRecords: true, snags: true, healthScores: true },
    });

    if (!aircraft) {
      throw new HttpError(404, "Aircraft not found");
    }

    res.json({ success: true, data: aircraft });
  }),
);

aircraftRouter.post(
  "/",
  requireRole(...AIRCRAFT_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const { aircraftNo, model, manufacturer, serialNumber, registrationNo, status, totalFlightHours, notes } =
      req.body as Record<string, unknown>;

    if (!aircraftNo || !model || !manufacturer) {
      throw new HttpError(400, "aircraftNo, model, and manufacturer are required");
    }

    const data = await prisma.aircraft.create({
      data: {
        aircraftNo: String(aircraftNo),
        model: String(model),
        manufacturer: String(manufacturer),
        serialNumber: serialNumber ? String(serialNumber) : undefined,
        registrationNo: registrationNo ? String(registrationNo) : undefined,
        status: typeof status === "string" ? (status as never) : undefined,
        totalFlightHours: typeof totalFlightHours === "number" ? totalFlightHours : 0,
        notes: notes ? String(notes) : undefined,
      },
    });

    res.status(201).json({ success: true, data });
  }),
);

aircraftRouter.put(
  "/:id",
  requireRole(...AIRCRAFT_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const aircraftId = String(req.params.id);

    const data = await prisma.aircraft.update({
      where: { id: aircraftId },
      data: req.body,
    });

    res.json({ success: true, data });
  }),
);

aircraftRouter.delete(
  "/:id",
  requireRole(...AIRCRAFT_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    await prisma.aircraft.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

export default aircraftRouter;