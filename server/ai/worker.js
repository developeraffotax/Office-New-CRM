// ai/worker.js — background worker (ingestion + cleanup). Run it like your other workers:
//   package.json:  "aiWorker": "node ai/worker.js"        pm2 start npm --name ai-worker -- run aiWorker
import "dotenv/config";
import mongoose from "mongoose";
import { startIngestWorker } from "./queue/ingest.queue.js";
import { startAttachmentCleanup } from "./attachments/attachments.service.js";

const uri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI; // ⚠ use the env var your app uses
if (!uri) {
  console.error("[ai worker] Set MONGO_URI (or edit this file to match your env var).");
  process.exit(1);
}

await mongoose.connect(uri);
startIngestWorker();
startAttachmentCleanup();
console.log("[ai worker] running");

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}
