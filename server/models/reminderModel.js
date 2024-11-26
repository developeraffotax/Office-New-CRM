import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    title: { type: String, required: true },
    description: { type: String },
    taskId: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    redirectLink: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
