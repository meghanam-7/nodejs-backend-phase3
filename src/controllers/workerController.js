// CPU-intensive operation using Worker Threads
const runWorkerTask = async (req, res) => {
    const { cpuWorkerPool } = require("../utils/workerPool");

    const number = Number(req.query.number) || 35;

    const taskId = `${process.pid}-${Date.now()}-${Math.random()}`;

    const startTime = process.hrtime.bigint();

    try {
        const result = await cpuWorkerPool.runTask({
            taskId,
            number,
        });

        const endTime = process.hrtime.bigint();

        const latency =
            Number(endTime - startTime) / 1_000_000;

        return res.status(200).json({
            success: true,
            message: "CPU-intensive task completed using Worker Thread",
            execution: "worker-thread",
            taskId,
            number,
            result: result.result,
            latencyMs: Number(latency.toFixed(2)),
        });
    } catch (error) {
        console.error("Worker task failed:", error);

        return res.status(500).json({
            success: false,
            message: "Worker task failed",
            error: error.message,
        });
    }
};

module.exports = {
    runWorkerTask,
};