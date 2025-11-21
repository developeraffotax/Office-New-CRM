import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import cron from "node-cron";
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
// CONNECT DATABASE
// --------------------------------------------
connectDB();

// --------------------------------------------
// EXPRESS SETUP
// --------------------------------------------
const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// --------------------------------------------
// CREATE HTTP & SOCKET SERVER
// --------------------------------------------
const server = http.createServer(app);
export const io = initSocketServer(server);

// Attach Socket.io to Agenda
agenda.io = io;

// --------------------------------------------
// REGISTER ROUTES
// --------------------------------------------
registerRoutes(app);

// Gmail Webhook
app.post("/gmail-webhook", gmailWebhookHandler);

// Root route
app.get("/", (req, res) => {
  res.send(`<h1 style="color:green;">Server is running...</h1>`);
});

// --------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------
app.use(errorHandler);

// --------------------------------------------
// RUN CRON ONLY ON PRIMARY INSTANCE
// --------------------------------------------
const isClusterPrimary = process.env.pm_id === "0";

if (isClusterPrimary) {
  console.log("🕒 Starting scheduled tasks...");
  setupCronJobs();
}

// --------------------------------------------
// START SERVER
// --------------------------------------------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`.bgMagenta.white);
});

// --------------------------------------------
// REMOVE OLD LOGGING (NO MAPS ANYMORE)
// --------------------------------------------
// You now check presence via Redis, NOT in-memory maps.
// Example:

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

    // Optionally: log to monitoring service
  }
}, 6000);
