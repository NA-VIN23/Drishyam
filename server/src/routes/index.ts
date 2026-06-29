import { Router } from "express";
import authRouter from "./auth.routes";
import aircraftRouter from "./aircraft.routes";
import crewRouter from "./crew.routes";
import crewCertificationRouter from "./crew-certification.routes";
import crewShiftRouter from "./crew-shift.routes";
import policyRouter from "./policy.routes";
import flightLogRouter from "./flight-log.routes";
import maintenanceRouter from "./maintenance.routes";
import snagRouter from "./snag.routes";
import dashboardRouter from "./dashboard.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/aircraft", aircraftRouter);
apiRouter.use("/crew", crewRouter);
apiRouter.use("/crew-certifications", crewCertificationRouter);
apiRouter.use("/crew-shifts", crewShiftRouter);
apiRouter.use("/policies", policyRouter);
apiRouter.use("/flight-logs", flightLogRouter);
apiRouter.use("/maintenance-records", maintenanceRouter);
apiRouter.use("/snags", snagRouter);
apiRouter.use("/dashboard", dashboardRouter);

export default apiRouter;