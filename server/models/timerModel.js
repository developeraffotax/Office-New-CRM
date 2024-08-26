import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    note: {
      type: String,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    isRunning: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("timer", timerSchema);
