import { Queue } from "bullmq";
import { connection } from "../../utils/ioredis.js";

export const screenshotQueue = new Queue("screenshotQueue", { connection });

// Helper to add job safely
export const addScreenshotJob = async (data) => {
  try {
    const job = await screenshotQueue.add("processScreenshot", data, {
      attempts: 3, // Retry up to 3 times if it fails
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 10, // Keep the latest 100 completed jobs
      removeOnFail: 10,   // Keep failed jobs for inspection
    });

    console.log(`✅ Job added to screenshotQueue: ${job.id}`);
    return job;
  } catch (error) {
    console.error("❌ Failed to add job to screenshotQueue:", error);

    // Optionally rethrow or handle differently
    // throw new Error("Screenshot queue job failed to enqueue");
  }
};