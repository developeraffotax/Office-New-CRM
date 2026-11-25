// ai/queue/ingest.queue.js
// Ingestion runs in the background so uploads return instantly.
// Call startIngestWorker() from your existing PM2 worker process, after the Mongo connection is up.
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { ingestDocument, ingestProductDescription } from "../rag/ingest.js";

const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null, // required by BullMQ
});

export const ingestQueue = new Queue("kb-ingest", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const enqueueDocument = (documentId) =>
  ingestQueue.add("document", { documentId: String(documentId) });

export const enqueueDescription = (productId) =>
  ingestQueue.add("description", { productId: String(productId) });

export function startIngestWorker() {
  const worker = new Worker(
    "kb-ingest",
    async (job) => {
      if (job.name === "document") return ingestDocument(job.data.documentId);
      if (job.name === "description") return ingestProductDescription(job.data.productId);
    },
    { connection, concurrency: 2 }
  );
  worker.on("failed", (job, err) => console.error(`[kb-ingest] ${job?.name} failed:`, err.message));
  return worker;
}
