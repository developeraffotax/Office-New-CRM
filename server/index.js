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
import analyticsRoute from "./routes/Analytics.js/customImpressions.js";

import http from "http";
import { initSocketServer } from "./socketServer.js";

// Dotenv Config
dotenv.config();

// DB Config
connectDB();

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

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

// Rest API's
app.use("/", (req, res) => {
  res.send(`<h1 style="color:red;">Server is running...</h1>`);
});

// Listening
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`.bgMagenta.white);
});
