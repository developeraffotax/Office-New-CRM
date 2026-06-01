import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Worker } from "bullmq";
import { connection as redisConnection } from "../../../utils/ioredis.js";
import { connectDB, disconnectDB } from "../../../config/db.js";
 
import logger from "../utils/logger.js";
import { processReactionUpdate } from "../../services/reaction.service.js";
import { processInboundMessage } from "../../services/message.service.js";
import { processStatusUpdate } from "../../services/status.service.js";

// ─────────────────────────────────────────────────────────────────
// Worker handle — kept in module scope for graceful shutdown
// ─────────────────────────────────────────────────────────────────
let worker;

/* ═══════════════════════════════════════════════════════════════
   JOB PROCESSOR
   ═══════════════════════════════════════════════════════════════ */

/**
 * Dispatches each job to the right service function.
 *
 * Job names:
 *   "inbound"  → { message, contact, metadata }
 *   "status"   → { status, metadata }
 */
const processJob = async (job) => {
  const { name, data, id, attemptsMade } = job;

  logger.info(`[Worker] Processing job`, { jobId: id, name, attempt: attemptsMade + 1 });

  switch (name) {
    case "inbound": {
      const { message, contact, metadata } = data;

      if (!message?.id) {
        logger.warn("[Worker] Inbound job missing message.id — skipping", { jobId: id });
        return;
      }

      // ── Determine Inbound Event Type ──────────────────────────────
      if (message.type === "reaction") {
        // Extract reaction specific properties
        const { message_id, emoji } = message.reaction; 
        
        // Note: If a user removes a reaction, emoji will be an empty string ""
        await processReactionUpdate(message.from, message_id, emoji);

        logger.info("[Worker] Reaction updated", {
          jobId: id,
          from: message.from,
          reactingTo: message_id,
          emoji: emoji || "REMOVED",
        });
      } else {
        // ── Standard Message Processing ─────────────────────────────
        
        // OPTIONAL: Trigger an outgoing typing indicator here if 
        // processInboundMessage takes more than 1-2 seconds (e.g. AI generation)
        // await sendTypingIndicator(message.from, metadata.phone_number_id);

        await processInboundMessage(message, contact, metadata);

        logger.info("[Worker] Inbound message persisted", {
          jobId: id,
          whatsappMessageId: message.id,
          from: message.from,
          type: message.type,
        });
      }
      break;
    }

    case "status": {
      const { status } = data;

      if (!status?.id) {
        logger.warn("[Worker] Status job missing status.id — skipping", { jobId: id });
        return;
      }

      await processStatusUpdate(status);

      logger.info("[Worker] Status updated", {
        jobId:             id,
        whatsappMessageId: status.id,
        status:            status.status,
      });
      break;
    }

    default:
      logger.warn("[Worker] Unknown job name — skipping", { jobId: id, name });
  }
};

/* ═══════════════════════════════════════════════════════════════
   STARTUP
   ═══════════════════════════════════════════════════════════════ */

const startWorker = async () => {
  // 1. Connect MongoDB
  try {
    await connectDB();
    logger.info("[Worker] MongoDB connected");
  } catch (err) {
    logger.error("[Worker] MongoDB connection failed", { err: err.message });
    process.exit(1);
  }

  // 2. Wait for Redis
  if (redisConnection.status !== "ready") {
    logger.info("[Worker] Waiting for Redis...");
    await new Promise((resolve) => redisConnection.once("ready", resolve));
  }
  logger.info("[Worker] Redis ready");

  // 3. Create BullMQ worker
  worker = new Worker("whatsapp-messages", processJob, {
    connection: redisConnection,

    // Concurrency: how many jobs run in parallel inside this single worker process.
    // Tune based on your DB capacity. Start with 5, increase if queue backs up.
    concurrency: 5,

    // Limiter: optional — cap throughput to avoid overwhelming the DB / WhatsApp API
    // limiter: { max: 50, duration: 1000 },
  });

  // ── Worker events ────────────────────────────────────────────────
  worker.on("completed", (job) => {
    logger.info("[Worker] Job completed", { jobId: job.id, name: job.name });
  });

  worker.on("failed", (job, err) => {
    logger.error("[Worker] Job failed", {
      jobId:       job?.id,
      name:        job?.name,
      attempt:     job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
      err:         err.message,
    });
  });

  worker.on("error", (err) => {
    // Worker-level errors (Redis disconnect, etc.)
    logger.error("[Worker] Worker error", { err: err.message });
  });

  worker.on("stalled", (jobId) => {
    // Job was running but worker crashed — BullMQ will re-queue it
    logger.warn("[Worker] Job stalled (will be retried)", { jobId });
  });

  logger.info("[Worker] WhatsApp message worker started ✅");
};

/* ═══════════════════════════════════════════════════════════════
   GRACEFUL SHUTDOWN
   ═══════════════════════════════════════════════════════════════ */

const gracefulShutdown = async (signal) => {
  logger.info(`[Worker] ${signal} received — shutting down gracefully...`);

  try {
    if (worker) {
      // Stops accepting new jobs; waits for active jobs to finish
      await worker.close();
      logger.info("[Worker] BullMQ worker closed");
    }

    if (redisConnection) {
      await redisConnection.quit();
      logger.info("[Worker] Redis connection closed");
    }

    await disconnectDB();
    logger.info("[Worker] MongoDB disconnected");

    process.exit(0);
  } catch (err) {
    logger.error("[Worker] Error during shutdown", { err: err.message });
    process.exit(1);
  }
};

process.on("SIGINT",  () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Catch uncaught errors so the worker doesn't silently die
process.on("uncaughtException", (err) => {
  logger.error("[Worker] Uncaught exception", { err: err.message, stack: err.stack });
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("[Worker] Unhandled rejection", { reason });
  gracefulShutdown("unhandledRejection");
});

/* ═══════════════════════════════════════════════════════════════
   START
   ═══════════════════════════════════════════════════════════════ */
startWorker();
