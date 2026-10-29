// ai/queues/followUp.queue.js
import { Queue } from "bullmq"; 
import { connection } from "../../../utils/ioredis.js";

export const FOLLOWUP_QUEUE = "email-followups";

export const followUpQueue = new Queue(FOLLOWUP_QUEUE, { connection: connection });

// Idempotent: safe to call on every worker boot
export async function registerFollowUpSweeper() {
  await followUpQueue.upsertJobScheduler(
    "followup-sweeper",
    { every: 60 * 1000 },
    { name: "sweep" },
  );
}


