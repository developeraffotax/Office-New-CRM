import { Worker } from "bullmq";
 import { connection } from "../../utils/ioredis.js";
import screenshotModel from "../../models/screenshotModel.js";
import { getFileUrl } from "../../utils/s3/s3Actions.js";
// import { uploadToS3 } from "../../utils/s3/s3Upload.js"; // if needed

export const screenshotWorker = new Worker(
  "screenshotQueue",
  async (job) => {
    try {
      const { file, body } = job.data;
      if (!file) throw new Error("Missing file in job data");
      if (!body?.userId) throw new Error("Missing userId in job data");

      const { timestamp, userId, activeWindow, activity } = body;

      // Build S3 URL
      const s3Key = file.key || file.filename;
      const s3Url = file.location || getFileUrl(s3Key);

      // Validate and parse optional JSON safely
      let parsedActiveWindow, parsedActivity;
      try {
        parsedActiveWindow = activeWindow ? JSON.parse(activeWindow) : undefined;
      } catch (e) {
        console.warn(`⚠️ Invalid JSON for activeWindow in job ${job.id}`);
      }
      try {
        parsedActivity = activity ? JSON.parse(activity) : undefined;
      } catch (e) {
        console.warn(`⚠️ Invalid JSON for activity in job ${job.id}`);
      }

      // Save screenshot record
      const doc = await screenshotModel.create({
        userId,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        s3Key,
        s3Url,
        activeWindow: parsedActiveWindow,
        activity: parsedActivity,
      });

      return { id: doc._id, s3Url };
    } catch (error) {
      console.error(`❌ Job ${job.id} failed during processing:`, error);
      // Re-throw so BullMQ will mark it as failed and trigger retries
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // optional — limits parallel jobs
  }
);

// ✅ Global Worker Event Handling
screenshotWorker.on("completed", (job, result) => {
  console.log(`✅ Screenshot job ${job.id} completed successfully:`, result);
});

screenshotWorker.on("failed", (job, err) => {
  console.error(`❌ Screenshot job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
});

screenshotWorker.on("error", (err) => {
  console.error("⚠️ Worker connection error:", err);
});
