// workers/historySync.worker.js
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Worker } from "bullmq";
import { connection as redisConnection } from "../../../utils/ioredis.js";
import { persistThread } from "../../services/persistThread.js";
import { connectDB, disconnectDB } from "../../../config/db.js"; // Add disconnectDB if not exist

 

// ---------------------------
// Worker Setup
// ---------------------------
let worker;

const startWorker = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected for Gmail History Sync Worker");
  } catch (err) {
    console.error("❌ Failed to connect MongoDB:", err);
    process.exit(1);
  }

  // 2️⃣ Wait for Redis ready
  if (redisConnection.status !== "ready") {
    console.log("⏳ Waiting for Redis to be ready...");
    await new Promise((resolve) => redisConnection.once("ready", resolve));
  }

  console.log("👷‍♂️ Gmail History Sync Worker started and listening for jobs...");

  // 3️⃣ Create BullMQ Worker
  worker = new Worker(
    "gmail-sync-all",
    async ({ data }) => {
      const { companyName, threadIds = [], type = "" } = data;

      if (!companyName || !threadIds.length) {
        console.warn("⚠️ Missing companyName or threadIds in job data");
        return;
      }

      console.log(`📩 Processing ${threadIds.length} threads for company: ${companyName}`);

      let processedCount = 0;

      for (const threadId of threadIds) {
        try {
          await persistThread({ threadId, companyName, type });
          processedCount++;
          console.log(`✅ Thread persisted: ${threadId}`);
        } catch (err) {
          console.error(`❌ Failed to persist thread ${threadId}:`, err);
        }
      }

      console.log(`✅ Completed history sync job for ${companyName}. Total threads processed: ${processedCount}`);
    },
    { connection: redisConnection }
  );

  // Worker event logging
  worker.on("completed", (job) => console.log(`✅ Job completed: ${job.id}`));
  worker.on("failed", (job, err) => console.error(`❌ Job failed: ${job.id}`, err));
};

// ---------------------------
// Graceful Shutdown
// ---------------------------
const gracefulShutdown = async () => {
  console.log("⚠️ Shutting down Gmail History Sync Worker...");

  try {
    if (worker) {
      await worker.close();
      console.log("✅ BullMQ worker closed");
    }

    if (redisConnection) {
      await redisConnection.quit();
      console.log("✅ Redis connection closed");
    }

    await disconnectDB();
    console.log("✅ MongoDB disconnected");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

// Listen to termination signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// ---------------------------
// Start the worker
// ---------------------------
startWorker();
