import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Worker } from "bullmq";
import { connection as redisConnection } from "../../../utils/ioredis.js";
import { connectDB, disconnectDB } from "../../../config/db.js";

import { processReactionUpdate } from "../../services/reaction.service.js";
import {
  processInboundMessage,
  processMessageEcho,
} from "../../services/webhook.service.js";
import { processStatusUpdate } from "../../services/status.service.js";
import logger from "../../utils/logger.js";

let worker;



const processJob = async (job) => {
  const { name, data, id, attemptsMade } = job;

  switch (name) {
    case "inbound": {
      const { message, contact, metadata } = data;

      if (!message?.id) {
        logger.warn("[Worker] Inbound job missing message.id — skipping", { jobId: id, });
        return;
      }

       
      if (message.type === "reaction") {

        const { message_id, emoji } = message.reaction;
        await processReactionUpdate(message.from, message_id, emoji);

      } else {
        
        // OPTIONAL: Trigger an outgoing typing indicator here if
        // processInboundMessage takes more than 1-2 seconds (e.g. AI generation)
        // await sendTypingIndicator(message.from, metadata.phone_number_id);

        await processInboundMessage(message, contact, metadata);

      }
      break;
    }

    case "status": {
      const { status } = data;

      if (!status?.id) {
        logger.warn("[Worker] Status job missing status.id — skipping", { jobId: id, });
        return;
      }

      await processStatusUpdate(status);
      
      // setTimeout(async() => {
        
      // }, 5000)

      break;
    }

    case "echo": {
      const { echo, metadata } = data;

      if (!echo?.id) {
        logger.warn("[Worker] Echo job missing echo.id", { jobId: id, });
        return;
      }

      await processMessageEcho(echo, metadata);

      break;
    }

    default:
      logger.warn("[Worker] Unknown job name — skipping", { jobId: id, name });
  }
};





















 
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
    concurrency: 5,
 
  });

  // ── Worker events ────────────────────────────────────────────────
  worker.on("completed", (job) => {
    logger.info("[Worker] Job completed", { jobId: job.id, name: job.name });
  });

  worker.on("failed", (job, err) => {
    logger.error("[Worker] Job failed", { jobId: job?.id, name: job?.name, attempt: job?.attemptsMade, maxAttempts: job?.opts?.attempts, err: err.message, });
  });

  worker.on("error", (err) => {
    logger.error("[Worker] Worker error", { err: err.message });
  });

  worker.on("stalled", (jobId) => {
    logger.warn("[Worker] Job stalled (will be retried)", { jobId });
  });



  logger.info("[Worker] WhatsApp message worker started ✅");
};


 
const gracefulShutdown = async (signal) => {
  logger.info(`[Worker] ${signal} received — shutting down gracefully...`);

  try {
    if (worker) {
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

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

 
process.on("uncaughtException", (err) => {
  logger.error("[Worker] Uncaught exception", { err: err.message, stack: err.stack, });
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("[Worker] Unhandled rejection", { reason });
  gracefulShutdown("unhandledRejection");
});
 












startWorker();
