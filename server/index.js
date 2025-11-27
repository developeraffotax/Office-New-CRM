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
import { gmailWebhookHandler } from "./utils/pubSubPush.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { connection as redis } from "./utils/ioredis.js";
import agenda from "./utils/agenda.js";

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
// ASYNC SERVER START
// --------------------------------------------
const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected");

    // 2️⃣ Express setup
    const app = express();
    app.use(express.json({ limit: "20mb" }));
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.urlencoded({ extended: true, limit: "20mb" }));

    // 3️⃣ HTTP & Socket server
    const server = http.createServer(app);
    io = initSocketServer(server); // initialize io
    agenda.io = io; // attach to agenda

    // 4️⃣ Register routes
    registerRoutes(app);
    app.post("/gmail-webhook", gmailWebhookHandler);
    app.get("/", (req, res) => {
      res.send(`<h1 style="color:green;">Server is running...</h1>`);
    });

    // 5️⃣ Global error handler
    app.use(errorHandler);

    // 6️⃣ Run cron jobs only on primary instance
    const isClusterPrimary = process.env.pm_id === "0";
    if (isClusterPrimary) {
      console.log("🕒 Starting scheduled tasks...");
      setupCronJobs();
    }

    // 7️⃣ Start server
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`.bgMagenta.white);
    });

    // 8️⃣ Redis interval logging
    setInterval(async () => {
      try {
        if (redis && redis.status === "ready") {
          const users = await redis.smembers("onlineUsers");
          const agents = await redis.smembers("onlineAgents");
          console.log("Users💜💜💜", users);
          console.log("Agents💛💛💛", agents);
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
