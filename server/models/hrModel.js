import mongoose from "mongoose";

const hrSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
    },
    category: {
      type: String,
      trim: true,
    },
    software: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("HR", hrSchema);
