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
    jobHolderName: {
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
    companyName: {
      type: String,
    },
    activity: {
      type: String,
      default: "Chargeable",
    },
    holiday: {
      type: String,
      default: "",
    },

    isRunning: { type: Boolean, default: false },
  },
  { timestamps: true }
);


timerSchema.index(
  { clientId: 1 },
  {
    unique: true,
    partialFilterExpression: { isRunning: true }
  }
);

export default mongoose.model("timer", timerSchema);
