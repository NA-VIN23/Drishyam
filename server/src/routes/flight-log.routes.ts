import { Router } from "express";
import prisma from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { FLIGHT_LOG_WRITE_ROLES } from "../constants/rbac";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

const flightLogRouter = Router();

flightLogRouter.use(requireAuth);

flightLogRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await prisma.flightLog.findMany({
      orderBy: { flightDate: "desc" },
      include: { aircraft: true, crewMembers: { include: { crew: true } } },
    });

    res.json({ success: true, data });
  }),
);

flightLogRouter.post(
  "/",
  requireRole(...FLIGHT_LOG_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const {
      logNumber,
      aircraftId,
      flightDate,
      flightHours,
      engineRpm,
      engineTemperature,
      fuelUsed,
      notes,
      status,
      crewAssignments = [],
    } = req.body as Record<string, unknown>;

    if (!logNumber || !aircraftId || !flightDate || typeof flightHours !== "number") {
      throw new HttpError(400, "logNumber, aircraftId, flightDate, and flightHours are required");
    }

    const data = await prisma.$transaction(async (tx) => {
      const flightLog = await tx.flightLog.create({
        data: {
          logNumber: String(logNumber),
          aircraftId: String(aircraftId),
          flightDate: new Date(String(flightDate)),
          flightHours,
          engineRpm: typeof engineRpm === "number" ? engineRpm : undefined,
          engineTemperature: typeof engineTemperature === "number" ? engineTemperature : undefined,
          fuelUsed: typeof fuelUsed === "number" ? fuelUsed : undefined,
          notes: notes ? String(notes) : undefined,
          status: typeof status === "string" ? (status as any) : undefined,
          createdById: req.currentUser?.id,
          crewMembers: {
            create: Array.isArray(crewAssignments)
              ? crewAssignments.map((assignment) => {
                  const item = assignment as { crewId?: string; dutyRole?: string };
                  return {
                    crewId: String(item.crewId ?? ""),
                    dutyRole: String(item.dutyRole ?? "Crew"),
                  };
                })
              : [],
          },
        },
        include: { crewMembers: true },
      });

      // Update aircraft total flight hours
      await tx.aircraft.update({
        where: { id: String(aircraftId) },
        data: {
          totalFlightHours: {
            increment: flightHours,
          },
        },
      });

      return flightLog;
    });

    res.status(201).json({ success: true, data });
  }),
);

flightLogRouter.put(
  "/:id",
  requireRole(...FLIGHT_LOG_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const flightLogId = String(req.params.id);

    const data = await prisma.$transaction(async (tx) => {
      const existingLog = await tx.flightLog.findUnique({
        where: { id: flightLogId },
      });

      if (!existingLog) {
        throw new HttpError(404, "Flight log not found");
      }

      const { crewAssignments, ...restBody } = req.body as Record<string, any>;
      const newAircraftId = restBody.aircraftId ? String(restBody.aircraftId) : existingLog.aircraftId;
      const newFlightHours = typeof restBody.flightHours === "number" ? restBody.flightHours : existingLog.flightHours;

      const updated = await tx.flightLog.update({
        where: { id: flightLogId },
        data: {
          ...restBody,
          flightDate: restBody.flightDate ? new Date(String(restBody.flightDate)) : undefined,
          crewMembers: crewAssignments
            ? {
                deleteMany: {},
                create: crewAssignments.map((c: any) => ({
                  crewId: String(c.crewId),
                  dutyRole: String(c.dutyRole || "Crew"),
                })),
              }
            : undefined,
        },
        include: { crewMembers: true },
      });

      // Adjust hours on aircraft
      if (existingLog.aircraftId === newAircraftId) {
        const diff = newFlightHours - existingLog.flightHours;
        if (diff !== 0) {
          await tx.aircraft.update({
            where: { id: existingLog.aircraftId },
            data: {
              totalFlightHours: {
                increment: diff,
              },
            },
          });
        }
      } else {
        // Aircraft changed: decrement old aircraft and increment new one
        await tx.aircraft.update({
          where: { id: existingLog.aircraftId },
          data: {
            totalFlightHours: {
              decrement: existingLog.flightHours,
            },
          },
        });
        await tx.aircraft.update({
          where: { id: newAircraftId },
          data: {
            totalFlightHours: {
              increment: newFlightHours,
            },
          },
        });
      }

      return updated;
    });

    res.json({ success: true, data });
  }),
);

flightLogRouter.delete(
  "/:id",
  requireRole(...FLIGHT_LOG_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const flightLogId = String(req.params.id);

    await prisma.$transaction(async (tx) => {
      const log = await tx.flightLog.findUnique({
        where: { id: flightLogId },
      });

      if (!log) {
        throw new HttpError(404, "Flight log not found");
      }

      await tx.flightLog.delete({
        where: { id: flightLogId },
      });

      // Decrement aircraft flight hours
      await tx.aircraft.update({
        where: { id: log.aircraftId },
        data: {
          totalFlightHours: {
            decrement: log.flightHours,
          },
        },
      });
    });

    res.status(204).send();
  }),
);

export default flightLogRouter;