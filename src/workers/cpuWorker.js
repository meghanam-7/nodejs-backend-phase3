const { parentPort } = require("worker_threads");

function fibonacci(n) {
    if (n <= 1) {
        return n;
    }

    return fibonacci(n - 1) + fibonacci(n - 2);
}

parentPort.on("message", ({ taskId, number }) => {
    try {
        const result = fibonacci(number);

        parentPort.postMessage({
            taskId,
            success: true,
            result,
        });
    } catch (error) {
        parentPort.postMessage({
            taskId,
            success: false,
            error: error.message,
        });
    }
});