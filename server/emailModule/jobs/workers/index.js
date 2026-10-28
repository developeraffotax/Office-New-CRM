// ai/workers/index.js
import "dotenv/config"; // MUST stay the first import (see note below)
 import { startFollowUpWorker } from "./followUp.worker.js";
import { followUpQueue, registerFollowUpSweeper } from "../queues/followUp.queue.js";
import { connectDB, disconnectDB } from "../../../config/db.js";



async function main() {
    try {
      // 1️⃣ Connect to MongoDB
      await connectDB();
      console.log("✅ MongoDB connected for Gmail History Sync Worker");
    } catch (err) {
      console.error("❌ Failed to connect MongoDB:", err);
      process.exit(1);
    }

  await registerFollowUpSweeper();
  const worker = startFollowUpWorker();
  console.log("[followup-worker] started");

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[followup-worker] ${signal} received, finishing in-flight jobs...`);
    try {
      await worker.close(); // waits for the current job to finish
      await followUpQueue.close();
      await disconnectDB();
    } catch (err) {
      console.error("[followup-worker] shutdown error:", err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));   // PM2 stop/restart sends this
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[followup-worker] failed to start:", err);
  process.exit(1);
});