const express = require("express");
const prisma = require("../config/prismaClient");

const router = express.Router();

router.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: "OK",
            message: "Server and database are healthy",
        });
    } catch (error) {
        res.status(503).json({
            status: "ERROR",
            message: "Database is unavailable",
        });
    }
});

module.exports = router;