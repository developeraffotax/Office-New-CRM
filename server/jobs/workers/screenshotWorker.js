import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });  // Make sure env variables are loaded

import { Worker } from "bullmq";
import { connection } from "../../utils/ioredis.js";
import screenshotModel from "../../models/screenshotModel.js";



import { getFileUrl } from "../../utils/s3/s3Actions.js";


 



let screenshotWorker;


async function initScreenshotWorker() {
  console.log("👷 Starting Screenshot Worker...", process.env);
  try {
    screenshotWorker = new Worker(
      "screenshotQueue",
      async (job) => {
        try {
          const { s3Url, s3Key, timestamp, userId, activeWindow, activity } = job.data;

          if (!userId) throw new Error("Missing userId in job data");

        

          console.log("activeWindow", activeWindow)
          console.log("activity", activity)
          // try {
          //   parsedActiveWindow = activeWindow ? JSON.parse(activeWindow) : undefined;
          // } catch {
          //   console.warn(`⚠️ Invalid JSON for activeWindow in job ${job.id}`);
          // }
          // try {
          //   parsedActivity = activity ? JSON.parse(activity) : undefined;
          // } catch {
          //   console.warn(`⚠️ Invalid JSON for activity in job ${job.id}`);
          // }

          const doc = await screenshotModel.create({
            userId,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            s3Key,
            s3Url,
            activeWindow: activeWindow,
            activity: activity,
          });

          return { id: doc._id, s3Url };
        } catch (error) {
          console.error(`❌ Job ${job.id} failed during processing:`, error);
          throw error;
        }
      },
      {
        connection,
        concurrency: 5,
        
        
      }
    );

    // ✅ Worker Events
    screenshotWorker.on("completed", (job, result) => {
      console.log(`✅ Screenshot job ${job.id} completed:`, result);
    });

    screenshotWorker.on("failed", (job, err) => {
      console.error(`❌ Screenshot job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
    });

    screenshotWorker.on("error", (err) => {
      console.error("⚠️ Worker Redis connection error:", err.message);
      console.log("🔁 Retrying connection in 5s...");
      setTimeout(initScreenshotWorker, 5000); // Retry connection
    });

    console.log("🚀 Screenshot Worker initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize screenshot worker:", err.message);
    console.log("🔁 Retrying in 5s...");
    setTimeout(initScreenshotWorker, 5000);
  }
}

// Initialize the worker safely
initScreenshotWorker();

export { screenshotWorker };
