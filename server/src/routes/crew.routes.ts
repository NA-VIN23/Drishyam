import { Router } from "express";
import prisma from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { CREW_WRITE_ROLES } from "../constants/rbac";

const crewRouter = Router();

crewRouter.use(requireAuth);

crewRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await prisma.crew.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, data });
  }),
);

crewRouter.post(
  "/",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const { name, designation, email, phone, employeeNo, licenseNumber, status, availabilityNote } = req.body as Record<string, unknown>;

    if (!name || !designation) {
      throw new HttpError(400, "name and designation are required");
    }

    const data = await prisma.crew.create({
      data: {
        name: String(name),
        designation: String(designation),
        email: email ? String(email) : undefined,
        phone: phone ? String(phone) : undefined,
        employeeNo: employeeNo ? String(employeeNo) : undefined,
        licenseNumber: licenseNumber ? String(licenseNumber) : undefined,
        status: typeof status === "string" ? (status as never) : undefined,
        availabilityNote: availabilityNote ? String(availabilityNote) : undefined,
      },
    });

    res.status(201).json({ success: true, data });
  }),
);

crewRouter.put(
  "/:id",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    const crewId = String(req.params.id);

    const data = await prisma.crew.update({
      where: { id: crewId },
      data: req.body,
    });

    res.json({ success: true, data });
  }),
);

crewRouter.delete(
  "/:id",
  requireRole(...CREW_WRITE_ROLES),
  asyncHandler(async (req, res) => {
    await prisma.crew.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }),
);

export default crewRouter;