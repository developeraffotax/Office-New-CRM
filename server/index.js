console.log("SERVER>>>>>>>>>>>>>>>>>>");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import colors from "colors";

import { connectDB } from "./config/db.js";
import { initSocketServer, Skey } from "./socketServer.js";
import { registerRoutes } from "./routes/index.js";
import { setupCronJobs } from "./cron/index.js";
import { gmailWebhookHandlerForAffotax, gmailWebhookHandlerForOutsource } from "./utils/pubSubPush.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { connection as redis } from "./utils/ioredis.js";
import agenda from "./utils/agenda.js";

// Bull Board imports
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

// Import your queue
import { gmailSyncQueue } from "./emailModule/jobs/queues/gmailSyncQueue.js";
 
dotenv.config();

// --------------------------------------------
// VALIDATE SECRET KEY
// --------------------------------------------
if (!process.env.SERVER_SECRET_KEY || process.env.SERVER_SECRET_KEY !== Skey) {
  console.error("❌ Invalid or missing SERVER_SECRET_KEY");
  process.exit(1);
}

// --------------------------------------------
// TOP-LEVEL EXPORTS
// --------------------------------------------
export let io; // Socket.io instance
export const getIO = () => io; // getter for other modules

// --------------------------------------------
// CREATE BULL BOARD
// --------------------------------------------
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(gmailSyncQueue)],
  serverAdapter,
});

// --------------------------------------------
// ASYNC SERVER START
// --------------------------------------------
const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    console.log("MONGO STARTING>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    await connectDB();
    console.log("✅ MongoDB connected");

    // 2️⃣ Express setup
    const app = express();

    // 3️⃣ Middleware
    app.use(express.json({ limit: "20mb" }));
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.urlencoded({ extended: true, limit: "20mb" }));

 

    // Bull Board route
    // app.use("/admin/queues", serverAdapter.getRouter());

    // 4️⃣ HTTP & Socket server
    const server = http.createServer(app);
    io = initSocketServer(server); // initialize io
    agenda.io = io; // attach to agenda

    // 5️⃣ Register app routes
    registerRoutes(app);
    app.post("/gmail-webhook", gmailWebhookHandlerForAffotax);
    app.post("/gmail-webhook-outsource", gmailWebhookHandlerForOutsource);
    app.get("/", (req, res) => {
      res.send(`<h1 style="color:green;">Server is running...</h1>`);
    });

    // 6️⃣ Global error handler
    app.use(errorHandler);

    // 7️⃣ Run cron jobs only on primary instance
    const isClusterPrimary = process.env.pm_id === "0" ;
    if (isClusterPrimary) {
      console.log("🕒 Starting scheduled tasks...");
      setupCronJobs();
    }
    
    // 8️⃣ Start server
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`.bgMagenta.white);
      console.log(`🎛 Bull Board: http://localhost:${PORT}/admin/queues`.bgBlue.white);
    });

    // 9️⃣ Redis interval logging
    setInterval(async () => {
      try {
        if (redis && redis.status === "ready") {
          const users = await redis.smembers("onlineUsers");
          const agents = await redis.smembers("onlineAgents");
          console.log("Users💜", users);
          console.log("Agents💛", agents);
        }
      } catch (redisError) {
        console.error(
          "⚠ Failed to get onlineUsers/onlineAgents via Redis:",
          redisError.message
        );
      }
    }, 60000);

  } catch (error) {
    console.error("❌ Server failed to start:", error.message || error);
    process.exit(1); // exit on DB failure
  }
};

// --------------------------------------------
// START SERVER
// --------------------------------------------
startServer();
