import mongoose from "mongoose";
import color from "colors";

export const connectDB = async (req, res) => {
  try {
    // const conn = await mongoose.connect(process.env.MONGO_URI);


    const conn = await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // 30s timeout
  family: 4, // force IPv4 (Atlas sometimes has IPv6 issues)
});
    console.log(
      `Successfully connected to MongoDB ${conn.connection.host}`.bgGreen.white
    );
  } catch (error) {
    console.log(error);
  }
};
