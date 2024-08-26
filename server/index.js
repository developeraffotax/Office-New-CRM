import express from "express";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/userRoutes.js";
import jobRoute from "./routes/jobsRoutes.js";
import timerRoute from "./routes/timerRoutes.js";
import commentRoute from "./routes/commentRoutes.js";
import projectRoute from "./routes/projectRoutes.js";
import taskRoute from "./routes/taskRoutes.js";
import http from "http";
import notificationRoute from "./routes/notificationRoutes.js";
import { initSocketServer } from "./socketServer.js";

// Dotenv COnfig
dotenv.config();

// DB Config
connectDB();

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

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

// Rest API's
app.use("/", (req, res) => {
  res.send(`<h1 style="color:red;">Server is running...</h1>`);
});

// Listening
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`.bgMagenta.white);
});
