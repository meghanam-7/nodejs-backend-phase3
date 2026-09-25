const { Worker } = require("worker_threads");
const path = require("path");

class WorkerPool {
    constructor(workerFile, poolSize = 2) {
        this.workerFile = workerFile;
        this.poolSize = poolSize;

        this.workers = [];
        this.taskQueue = [];
        this.taskId = 0;

        this.initializeWorkers();
    }

    initializeWorkers() {
        for (let i = 0; i < this.poolSize; i++) {
            this.createWorker();
        }
    }

    createWorker() {
        const worker = new Worker(this.workerFile);

        const workerData = {
            worker,
            busy: false,
            currentTask: null,
        };

        worker.on("message", (result) => {
            const task = workerData.currentTask;

            workerData.busy = false;
            workerData.currentTask = null;

            if (task) {
                task.resolve(result);
            }

            this.processQueue();
        });

        worker.on("error", (error) => {
            const task = workerData.currentTask;

            workerData.busy = false;
            workerData.currentTask = null;

            if (task) {
                task.reject(error);
            }

            console.error("Worker thread error:", error);

            this.workers = this.workers.filter(
                (item) => item !== workerData
            );

            this.createWorker();
            this.processQueue();
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                console.error(
                    `Worker stopped with exit code ${code}`
                );
            }
        });

        this.workers.push(workerData);
    }

    runTask(data) {
        return new Promise((resolve, reject) => {
            this.taskQueue.push({
                data,
                resolve,
                reject,
            });

            this.processQueue();
        });
    }

    processQueue() {
        const availableWorker = this.workers.find(
            (workerData) => !workerData.busy
        );

        if (!availableWorker || this.taskQueue.length === 0) {
            return;
        }

        const task = this.taskQueue.shift();

        availableWorker.busy = true;
        availableWorker.currentTask = task;

        availableWorker.worker.postMessage(task.data);

        this.processQueue();
    }

    async close() {
        await Promise.all(
            this.workers.map((workerData) =>
                workerData.worker.terminate()
            )
        );
    }
}

const workerFile = path.join(
    __dirname,
    "../workers/cpuWorker.js"
);

const cpuWorkerPool = new WorkerPool(workerFile, 2);

module.exports = {
    WorkerPool,
    cpuWorkerPool,
};