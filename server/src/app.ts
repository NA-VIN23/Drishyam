import express from "express";
import cors from "cors";
import prisma from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Drishyam API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

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