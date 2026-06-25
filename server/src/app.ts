import express from "express";
import cors from "cors";
import prisma from "./config/db";
import apiRouter from "./routes";
import { bootstrapCoreRoles } from "./services/bootstrap";
import { HttpError } from "./utils/httpError";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ success: true, message: "Drishyam API Running" });
});

app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
});

app.use("/api", apiRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
    }

    if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
        return;
    }

    res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
    try {
        await bootstrapCoreRoles();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

void startServer();

app.get("/test-db", async (_req, res) => {
    try {
        const users = await prisma.user.findMany();

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
        });
    }
});