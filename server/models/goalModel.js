import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      trim: true,
    },
    achievement: {
      type: String,
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
  },
  { timestamps: true }
);

export default mongoose.model("Goals", goalSchema);
