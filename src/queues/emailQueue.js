const { Queue } = require("bullmq");
const redisConnection = require("../config/redisConnection");

const emailQueue = new Queue("emailQueue", {
    connection: redisConnection,

    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "fixed",
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

module.exports = emailQueue;