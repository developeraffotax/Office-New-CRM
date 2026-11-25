// ai/index.js — mount once:  app.use("/api/ai", aiRouter);
import { Router } from "express";
import kbRoutes from "./routes/kb.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import attachmentRoutes from "./routes/attachments.routes.js";
import chatHistoryRoutes from "./routes/chatHistory.routes.js";
import "./agent/forms/registerForms.js"; // your CRM forms (see agent/forms/registry.js)
import { startIngestWorker } from "./queue/ingest.queue.js";
import { startAttachmentCleanup } from "./attachments/attachments.service.js";

export const aiRouter = Router();
aiRouter.use("/kb", kbRoutes); // admin: projects, products, documents, spreadsheets
aiRouter.use("/", agentRoutes); // POST /agent, /forms/:id/submit, /actions/:id/confirm|cancel
aiRouter.use("/", chatHistoryRoutes); // GET /me, /conversations, ...
aiRouter.use("/", attachmentRoutes); // POST /attachments, /attachments/:id/fill, GET /attachments/:id/download

// Call once from your PM2 worker process, after Mongo is connected.
export function startAiWorkers() {
  startIngestWorker();
  startAttachmentCleanup();
}