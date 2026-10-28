// models/FollowUpSchedule.js
import mongoose from "mongoose";

const FollowUpScheduleSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    threadId: { type: String, required: true }, // Gmail thread id
    emailThreadId: { type: mongoose.Schema.Types.ObjectId, ref: "EmailThread" },

    status: {
      type: String,
      enum: ["active", "paused", "stopped", "completed", "failed"],
      default: "active",
    },
    stopReason: { type: String, default: "" }, // client_replied | max_reached | cancelled | send_failed ...

    frequencyDays: { type: Number, required: true, min: 1, max: 60 },
    maxFollowUps: { type: Number, default: 3, min: 1, max: 10 },
    sentCount: { type: Number, default: 0 },

    nextRunAt: Date,
    lastRunAt: Date,
    failCount: { type: Number, default: 0 },
    lastError: { type: String, default: "" },

    customInstructions: { type: String, default: "", maxlength: 800 },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "aiProject", default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId },
    createdByName: String,

    history: [{ sentAt: Date, gmailMessageId: String }],
  },
  { timestamps: true },
);

FollowUpScheduleSchema.index({ companyName: 1, threadId: 1 }, { unique: true });
FollowUpScheduleSchema.index({ status: 1, nextRunAt: 1 });

export default mongoose.model("FollowUpSchedule", FollowUpScheduleSchema);