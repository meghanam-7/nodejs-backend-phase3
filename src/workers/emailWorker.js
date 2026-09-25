const { Worker } = require("bullmq");
const redisConnection = require("../config/redisConnection");

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("📩 Processing email job...");
    console.log("Job ID:", job.id);
    console.log("Job Data:", job.data);

  

    // Simulate email processing
    await job.updateProgress(25);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await job.updateProgress(50);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await job.updateProgress(100);

    console.log("✅ Email job completed");

    return {
      success: true,
      message: "Email processed successfully",
    };
  },
  {
    connection: redisConnection,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

emailWorker.on("progress", (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

emailWorker.on("failed", (job, error) => {
  console.log(`❌ Job ${job?.id} failed:`, error.message);
});

console.log("🚀 Email worker is running...");

module.exports = emailWorker;
