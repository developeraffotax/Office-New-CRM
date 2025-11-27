import mongoose from "mongoose";
import color from "colors";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30s timeout
      family: 4, // force IPv4
    });

    console.log(
      `✅ Successfully connected to MongoDB: ${conn.connection.host}`.bgGreen.white
    );
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message || error);
    process.exit(1); // exit immediately on failure
  }
};
 
