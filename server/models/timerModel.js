import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
    type: {
      type: String,
      default: "Timer",
    },
    note: {
      type: String,
    },
    department: {
      type: String,
    },
    clientName: {
      type: String,
    },
    JobHolderName: {
      type: String,
    },
    projectName: {
      type: String,
    },
    task: {
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
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
    },

    isRunning: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("timer", timerSchema);
