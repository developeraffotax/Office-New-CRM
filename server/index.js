import express from "express";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/userRoutes.js";
import jobRoute from "./routes/jobsRoutes.js";

// Dotenv COnfig
dotenv.config();

// DB Config
connectDB();

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// API's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/client", jobRoute);

// Rest API's
app.use("/", (req, res) => {
  res.send(`<h1 style="color:red;">Server is running...</h1>`);
});

// Listening
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`.bgMagenta.white);
});
