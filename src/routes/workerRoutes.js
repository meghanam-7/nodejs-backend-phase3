const express = require("express");

const router = express.Router();

const {
    runWorkerTask,
} = require("../controllers/workerController");

const isDevelopment = process.env.NODE_ENV !== "production";

if (isDevelopment) {
    router.get(
        "/api/worker/cpu",
        runWorkerTask
    );

    router.get(
        "/api/worker/health",
        (req, res) => {
            res.status(200).json({
                success: true,
                message: "Main event loop is responsive",
                processId: process.pid,
                timestamp: Date.now(),
            });
        }
    );
}

module.exports = router;