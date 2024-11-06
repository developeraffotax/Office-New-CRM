import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    pageUrl: { type: String, required: true },
    eventType: { type: String, enum: ["click", "impression"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Analytics", analyticsSchema);
