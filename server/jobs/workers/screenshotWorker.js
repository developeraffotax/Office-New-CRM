import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Worker } from "bullmq";
import { connection } from "../../utils/ioredis.js";
import screenshotModel from "../../models/screenshotModel.js";

let screenshotWorker;
let workerInitAttempts = 0;
const MAX_WORKER_INIT_ATTEMPTS = 3;

async function initScreenshotWorker() {
  try {
    workerInitAttempts++;

    if (workerInitAttempts > MAX_WORKER_INIT_ATTEMPTS) {
      console.error("❌ Screenshot worker failed to start after 3 attempts. Exiting.");
      process.exit(1); // Stop the process entirely, or handle differently
    }

    // Ensure Redis connection is ready before initializing the worker
    if (connection.status !== "ready") {
      throw new Error("Redis is not connected yet.");
    }

    screenshotWorker = new Worker(
      "screenshotQueue",
      async (job) => {
        try {
          const { s3Url, s3Key, timestamp, userId, activeWindow, activity } = job.data;

          if (!userId) throw new Error("Missing userId in job data");

          const doc = await screenshotModel.create({
            userId,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            s3Key,
            s3Url,
            activeWindow,
            activity,
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

    // Worker events
    screenshotWorker.on("completed", (job, result) => {
      console.log(`✅ Screenshot job ${job.id} completed:`, result);
    });

    screenshotWorker.on("failed", (job, err) => {
      console.error(`❌ Screenshot job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
    });

    screenshotWorker.on("error", (err) => {
      console.error("⚠️ Worker Redis connection error:", err.message);
      console.log("🔁 Retrying worker init in 5s...");
      setTimeout(initScreenshotWorker, 5000);
    });

    console.log("🚀 Screenshot Worker initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize screenshot worker:", err.message);
    console.log("🔁 Retrying in 5s...");
    setTimeout(initScreenshotWorker, 5000);
  }
}

// Initialize
initScreenshotWorker();

export { screenshotWorker };
