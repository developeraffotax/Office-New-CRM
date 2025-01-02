import setupCluster from "./cluster.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get port from environment variables
const PORT = process.env.PORT || 8080;

// Start clustering
setupCluster(PORT);
