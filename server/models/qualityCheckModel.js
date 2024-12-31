import mongoose from "mongoose";

const qualityCheckSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QualityCheck", qualityCheckSchema);
