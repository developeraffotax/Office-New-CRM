import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      trim: true,
    },
    achievement: {
      type: Number,
    },
    achievedCount: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    goalType: {
      type: String,
    },
    jobHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: {
      type: String,
      default: "Progress",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Goals", goalSchema);
