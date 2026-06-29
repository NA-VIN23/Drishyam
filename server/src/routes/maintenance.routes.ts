import { Router } from "express";
import prisma from "../config/db";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

const maintenanceRouter = Router();

maintenanceRouter.use(requireAuth);

maintenanceRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await prisma.maintenanceRecord.findMany({
      orderBy: { openedAt: "desc" },
      include: { aircraft: true, assignedTechnician: true, tasks: true, snag: true },
    });

    res.json({ success: true, data });
  }),
);

maintenanceRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      workOrderNumber,
      title,
      description,
      status,
      priority,
      aircraftId,
      assignedTechnicianId,
      tasks = [],
    } = req.body as Record<string, unknown>;

    if (!workOrderNumber || !title || !aircraftId) {
      throw new HttpError(400, "workOrderNumber, title, and aircraftId are required");
    }

    const data = await prisma.maintenanceRecord.create({
      data: {
        workOrderNumber: String(workOrderNumber),
        title: String(title),
        description: description ? String(description) : undefined,
        status: typeof status === "string" ? (status as never) : undefined,
        priority: typeof priority === "string" ? (priority as never) : undefined,
        aircraftId: String(aircraftId),
        assignedTechnicianId: assignedTechnicianId ? String(assignedTechnicianId) : undefined,
        tasks: {
          create: Array.isArray(tasks)
            ? tasks.map((task) => {
                const item = task as { title?: string; description?: string; assignedCrewId?: string; dueAt?: string };
                return {
                  title: String(item.title ?? "Task"),
                  description: item.description,
                  assignedCrewId: item.assignedCrewId,
                  dueAt: item.dueAt ? new Date(item.dueAt) : undefined,
                };
              })
            : [],
        },
      },
      include: { tasks: true },
    });

    res.status(201).json({ success: true, data });
  }),
);

maintenanceRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const maintenanceRecordId = String(req.params.id);

    const data = await prisma.maintenanceRecord.update({
      where: { id: maintenanceRecordId },
      data: req.body,
    });

    res.json({ success: true, data });
  }),
);

maintenanceRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.maintenanceRecord.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

// Update an individual task
maintenanceRouter.put(
  "/tasks/:taskId",
  asyncHandler(async (req, res) => {
    const taskId = String(req.params.taskId);
    const { status, completedAt, assignedCrewId } = req.body as Record<string, unknown>;

    const data = await prisma.maintenanceTask.update({
      where: { id: taskId },
      data: {
        status: status as any,
        completedAt: completedAt ? new Date(String(completedAt)) : null,
        assignedCrewId: assignedCrewId ? String(assignedCrewId) : undefined,
      },
    });

    res.json({ success: true, data });
  }),
);

// Add an individual task to a work order
maintenanceRouter.post(
  "/:id/tasks",
  asyncHandler(async (req, res) => {
    const maintenanceRecordId = String(req.params.id);
    const { title, description, assignedCrewId, dueAt } = req.body as Record<string, unknown>;

    const data = await prisma.maintenanceTask.create({
      data: {
        maintenanceRecordId,
        title: String(title),
        description: description ? String(description) : undefined,
        assignedCrewId: assignedCrewId ? String(assignedCrewId) : undefined,
        dueAt: dueAt ? new Date(String(dueAt)) : undefined,
      },
    });

    res.status(201).json({ success: true, data });
  }),
);

// Delete an individual task
maintenanceRouter.delete(
  "/tasks/:taskId",
  asyncHandler(async (req, res) => {
    await prisma.maintenanceTask.delete({ where: { id: String(req.params.taskId) } });
    res.status(204).send();
  }),
);

export default maintenanceRouter;