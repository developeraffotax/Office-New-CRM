import express from "express";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/userRoutes.js";
import jobRoute from "./routes/jobsRoutes.js";
import timerRoute from "./routes/timerRoutes.js";
import commentRoute from "./routes/commentRoutes.js";
import projectRoute from "./routes/projectRoutes.js";
import taskRoute from "./routes/taskRoutes.js";
import labelRoute from "./routes/labelRoutes.js";
import categoryRoute from "./routes/templates/categoryRoutes.js";
import templateRoute from "./routes/templates/templateRoutes.js";
import faqRoute from "./routes/templates/faqRoutes.js";
import ticketRoute from "./routes/ticketRoutes.js";
import leadRoute from "./routes/leadRoute.js";
import proposalRoute from "./routes/proposalRoute.js";
import roleRoute from "./routes/roleRoute.js";
import notificationRoute from "./routes/notificationRoutes.js";
import subscriptionRoute from "./routes/subscriptionRoutes.js";
import goalsRoute from "./routes/goalRoutes.js";
import complaintRoute from "./routes/complaintRoutes.js";
import analyticsRoute from "./routes/Analytics.js/customImpressions.js";
import activityRoute from "./routes/ActivityRoutes.js";
import reminderRoute from "./routes/reminderRoutes.js";
import meetingRoute from "./routes/meetingRoutes.js";
import hrRoute from "./routes/hrRoutes.js";
import departmentRoute from "./routes/departmentRoutes.js";
import quickListRoute from "./routes/quickListRoute.js";
import qualityListRoute from "./routes/qualityRoutes.js";

import cron from "node-cron";
const requiredKey = process.env.SERVER_SECRET_KEY;
import http from "http";
import { initSocketServer, Skey } from "./socketServer.js";
import { sendDatatoGoogleSheet } from "./utils/googleSheet.js";

export const createServer = (port) => {
  // Verify the key
  if (!requiredKey || requiredKey !== Skey) {
    process.exit(1);
  }

  // Dotenv Config
  dotenv.config();

  // DB Config
  connectDB();

  // Middlewares
  const app = express();
  app.use(express.json({ limit: "20mb" }));
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Init Socket Server
  const server = http.createServer(app);
  initSocketServer(server);

  // API's
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/client", jobRoute);
  app.use("/api/v1/timer", timerRoute);
  app.use("/api/v1/comments", commentRoute);
  app.use("/api/v1/notification", notificationRoute);
  app.use("/api/v1/projects", projectRoute);
  app.use("/api/v1/tasks", taskRoute);
  app.use("/api/v1/label", labelRoute);
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/templates", templateRoute);
  app.use("/api/v1/faqs", faqRoute);
  app.use("/api/v1/tickets", ticketRoute);
  app.use("/api/v1/leads", leadRoute);
  app.use("/api/v1/proposal", proposalRoute);
  app.use("/api/v1/roles", roleRoute);
  app.use("/api/v1/subscriptions", subscriptionRoute);
  app.use("/api/v1/goals", goalsRoute);
  app.use("/api/v1/analytics", analyticsRoute);
  app.use("/api/v1/complaints", complaintRoute);
  app.use("/api/v1/activies", activityRoute);
  app.use("/api/v1/reminders", reminderRoute);
  app.use("/api/v1/meetings", meetingRoute);
  app.use("/api/v1/hr", hrRoute);
  app.use("/api/v1/department", departmentRoute);
  app.use("/api/v1/quicklist", quickListRoute);
  app.use("/api/v1/quicklist", qualityListRoute);

  // Send Data to Google Sheet
  cron.schedule("0 13,20,23 * * *", () => {
    console.log("Running task scheduler for recurring tasks...");
    sendDatatoGoogleSheet();
  });

  // Rest API's
  app.use("/", (req, res) => {
    res.send(`<h1 style="color:red;">Server is running...</h1>`);
  });

  // Listening
  // const PORT = process.env.PORT || 8080;

  server.listen(port, () => {
    console.log(`Server is running at PORT ${port}`.bgMagenta.white);
  });
};
