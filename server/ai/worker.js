// ai/worker.js — background worker (ingestion + cleanup). Run it like your other workers:
//   package.json:  "aiWorker": "node ai/worker.js"        pm2 start npm --name ai-worker -- run aiWorker
import "dotenv/config";
import mongoose from "mongoose";
import { startIngestWorker } from "./queue/ingest.queue.js";
import { startAttachmentCleanup } from "./attachments/attachments.service.js";
import { connectDB } from "../config/db.js";

 

async function runWorker() {
  // 1. Connect MongoDB
  try {
    await connectDB();
    console.log("[ai worker] MongoDB connected");
  } catch (err) {
    console.error("[ai worker] MongoDB connection failed", err.message);
    process.exit(1);
  }

  // 2. Start workers
  startIngestWorker();
  startAttachmentCleanup();
  console.log("[ai worker] running");
}

// Graceful shutdown
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

// Start the worker
await runWorker();