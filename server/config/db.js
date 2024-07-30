import mongoose from "mongoose";
import color from "colors";

export const connectDB = async (req, res) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Successfully connected to MongoDB ${conn.connection.host}`.bgGreen.white
    );
  } catch (error) {
    console.log(error);
  }
};
