import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
 
import "./jobs/workers/screenshotWorker.js";

// Connect to MongoDB before starting workers
await connectDB();

console.log("👷 Worker started and connected to MongoDB + Redis queue");