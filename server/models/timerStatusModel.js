import mongoose from "mongoose";

const timerStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    taskName: {
      type: String,
    },
    taskId: {
      type: String,
    },
    pageName: {
      type: String,
    },
    taskLink: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("timerStatus", timerStatusSchema);
