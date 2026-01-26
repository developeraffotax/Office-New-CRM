import { gmailSyncQueue } from "../queues/gmailSyncQueue.js";
import { AFFOTAX } from "../../utils/constants.js";
 
import { connection } from "../../../utils/ioredis.js";
 
// Helper to safely add a job
export const initGmailSync = async (data) => {
  try {
    if (!connection.status || connection.status !== "ready") {
      console.warn("⚠️ Redis not ready — job will not be queued right now.");
      return null;
    }

    const job = await gmailSyncQueue.add("initial-sync", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 10,
      removeOnFail: 10,
    });

    console.log(`✅ Job added to gmailSyncQueue: ${job.id}`);
    return job;
  } catch (error) {
    console.error("❌ Failed to add job to gmailSyncQueue:", error.message);

    // Optional retry if Redis is temporarily unavailable
    if (error.message.includes("ECONNREFUSED") || error.message.includes("ETIMEDOUT")) {
      console.warn("🔁 Retrying job addition in 5s due to Redis connection issue...");
      setTimeout(() => addScreenshotJob(data), 5000);
    }
  }
};


const waitForRedisReady = () =>
  new Promise((resolve) => {
    if (connection.status === "ready") return resolve();
    connection.once("ready", resolve);
  });

await waitForRedisReady();
await initGmailSync({ companyName: AFFOTAX.name });
//initGmailSync({companyName: AFFOTAX.name});