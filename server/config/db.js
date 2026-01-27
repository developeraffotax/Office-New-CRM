// config/db.js
import mongoose from "mongoose";
import color from "colors";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]); // force IPv4 DNS

// ---------------------------
// Connect to MongoDB
// ---------------------------
export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("⚡ MongoDB already connected".cyan);
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30s timeout
      family: 4, // force IPv4
    });

    console.log(
      `✅ Successfully connected to MongoDB: ${conn.connection.host}`.bgGreen.white
    );
    return conn;
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:".bgRed.white,
      error.message || error
    );
    process.exit(1); // exit immediately on failure
  }
};

// ---------------------------
// Disconnect from MongoDB
// ---------------------------
export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("🛑 MongoDB disconnected successfully".yellow);
    } else {
      console.log("⚡ MongoDB already disconnected".cyan);
    }
  } catch (error) {
    console.error(
      "❌ Error disconnecting MongoDB:".bgRed.white,
      error.message || error
    );
  }
};
































// import mongoose from "mongoose";
// import color from "colors";

// import dns from 'node:dns';
// dns.setServers(['8.8.8.8', '8.8.4.4']);

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 30000, // 30s timeout
//       family: 4, // force IPv4
//     });

//     console.log(
//       `✅ Successfully connected to MongoDB: ${conn.connection.host}`.bgGreen.white
//     );
//     return conn;
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error.message || error);
//     process.exit(1); // exit immediately on failure
//   }
// };
 
