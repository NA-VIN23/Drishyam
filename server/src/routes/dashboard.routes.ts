import { Router } from "express";
import prisma from "../config/db";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const [aircraft, crew, flightLogs, maintenanceRecords, snags, policies] = await Promise.all([
      prisma.aircraft.count(),
      prisma.crew.count(),
      prisma.flightLog.count(),
      prisma.maintenanceRecord.count(),
      prisma.snag.count(),
      prisma.policy.count(),
    ]);

    const openSnags = await prisma.snag.count({ where: { status: "OPEN" } });
    const activeMaintenance = await prisma.maintenanceRecord.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } });

    res.json({
      success: true,
      data: {
        aircraft,
        crew,
        flightLogs,
        maintenanceRecords,
        snags,
        policies,
        openSnags,
        activeMaintenance,
      },
    });
  }),
);

export default dashboardRouter;