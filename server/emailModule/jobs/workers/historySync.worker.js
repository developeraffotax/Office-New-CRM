// workers/historySync.worker.js
import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { connection } from "../../../utils/ioredis.js";

import { getGmailClient } from "../../services/gmail.service.js";
import { persistThread } from "../../services/persistThread.js";

/**
 * Gmail History Sync Worker
 * - This worker will simply upsert threads in DB
 * - No delta / history logic added
 * - Expects job data: { companyName, threadIds: [] }
 */
const startWorker = async () => {
  // Wait for Redis to be ready
  if (connection.status !== "ready") {
    console.log("⏳ Waiting for Redis to be ready...");
    await new Promise((resolve) => connection.once("ready", resolve));
  }

  console.log("👷‍♂️ Gmail history sync worker started and listening for jobs...");

  new Worker(
    "gmail-sync-all",
    async ({ data }) => {
      const { companyName, threadIds = [] } = data;

      if (!companyName || !threadIds.length) {
        console.warn("⚠️ Missing companyName or threadIds in job data");
        return;
      }

      console.log(`📩 Processing ${threadIds.length} threads for company: ${companyName}`);

      // Get Gmail client
      const gmail = await getGmailClient(companyName);

      let processedCount = 0;

      for (const threadId of threadIds) {
        try {
          await persistThread({ threadId, companyName });
          processedCount++;
          console.log(`✅ Thread persisted: ${threadId}`);
        } catch (err) {
          console.error(`❌ Failed to persist thread ${threadId}:`, err);
        }
      }

      console.log(`✅ Completed history sync job for ${companyName}. Total threads processed: ${processedCount}`);
    },
    { connection }
  );
};

// Start the worker
startWorker();
