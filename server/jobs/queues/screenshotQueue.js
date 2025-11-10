import { Queue } from "bullmq";
import { connection } from "../../utils/ioredis.js";


export const screenshotQueue = new Queue("screenshotQueue", { connection });

// Helper to safely add a job
export const addScreenshotJob = async (data) => {
  try {
    if (!connection.status || connection.status !== "ready") {
      console.warn("⚠️ Redis not ready — job will not be queued right now.");
      return null;
    }

    const job = await screenshotQueue.add("processScreenshot", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 10,
      removeOnFail: 10,
    });

    console.log(`✅ Job added to screenshotQueue: ${job.id}`);
    return job;
  } catch (error) {
    console.error("❌ Failed to add job to screenshotQueue:", error.message);

    // Optional retry if Redis is temporarily unavailable
    if (error.message.includes("ECONNREFUSED") || error.message.includes("ETIMEDOUT")) {
      console.warn("🔁 Retrying job addition in 5s due to Redis connection issue...");
      setTimeout(() => addScreenshotJob(data), 5000);
    }
  }
};