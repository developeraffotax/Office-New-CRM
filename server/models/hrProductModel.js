import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // add more fields later if needed (description, isActive, etc.)
  },
  { timestamps: true }
);

export default mongoose.model("hrProduct", productSchema);