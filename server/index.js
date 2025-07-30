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

import agenda from "./utils/agenda.js";
import { updateSendReceivedLeads } from "./utils/updateSendReceivedLeads.js";

dotenv.config();

// Validate secret key
if (!process.env.SERVER_SECRET_KEY || process.env.SERVER_SECRET_KEY !== Skey) {
  console.error("❌ Invalid or missing SERVER_SECRET_KEY");
  process.exit(1);
}

// Connect to DB
connectDB();

// Setup express
const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));


export const onlineUsers = new Map();
console.log("OnlineUsers 💚",onlineUsers)


// Create server and socket
const server = http.createServer(app);
export const io = initSocketServer(server);

agenda.io = io;  


// Register routes
registerRoutes(app);



// Gmail webhook route
app.post("/gmail-webhook", gmailWebhookHandler);

// Root route
app.get("/", (req, res) => {
  res.send(`<h1 style="color:green;">Server is running...</h1>`);
});

// Error handling middleware
app.use(errorHandler);





// const isDev = process.env.NODE_ENV === "development";
const isClusterPrimary = process.env.pm_id === "0";

// console.log(`🚀 Server running in ${isDev ? "development" : "production"} mode`.bgGreen.white);
// Cron jobs
if (isClusterPrimary) {
  console.log("🕒 Starting scheduled tasks...");
  setupCronJobs();

  //comment it out later
  updateSendReceivedLeads();
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`.bgMagenta.white);
});
