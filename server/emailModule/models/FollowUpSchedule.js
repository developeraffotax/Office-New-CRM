// models/FollowUpSchedule.js (replace)
import mongoose from "mongoose";

const FollowUpScheduleSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    threadId: { type: String, required: true },
    emailThreadId: { type: mongoose.Schema.Types.ObjectId, ref: "EmailThread" },

    status: {
      type: String,
      enum: ["active", "paused", "stopped", "completed", "failed"],
      default: "active",
    },
    stopReason: { type: String, default: "" },

    // what is automated
    autoReply: { type: Boolean, default: false },
    autoFollowUp: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    enabledAt: Date, // inbound mail older than this is never auto-replied

    // follow-up settings
    frequencyDays: { type: Number, default: 5, min: 1, max: 60 },
    maxFollowUps: { type: Number, default: 3, min: 1, max: 10 },
    sentCount: { type: Number, default: 0 },
    startDate: { type: String, default: "" }, // "YYYY-MM-DD": first follow-up not before this day
    sendTime: { type: String, default: "09:00" }, // "HH:mm" in `timezone`
    timezone: { type: String, default: "UTC" },
    nextRunAt: { type: Date, default: null }, // null = follow-up clock not running
    lastRunAt: Date,

    // auto-reply settings
    maxAutoReplies: { type: Number, default: 3, min: 1, max: 10 }, // loop guard
    replyCount: { type: Number, default: 0 },
    lastInboundMessageId: { type: String, default: "" }, // once-per-message guard

    failCount: { type: Number, default: 0 },
    lastError: { type: String, default: "" },

    customInstructions: { type: String, default: "", maxlength: 800 },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "aiProject", default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId },
    createdByName: String,

    history: [{ kind: String, sentAt: Date, gmailMessageId: String }],
  },
  { timestamps: true },
);

FollowUpScheduleSchema.index({ companyName: 1, threadId: 1 }, { unique: true });
FollowUpScheduleSchema.index({ status: 1, autoFollowUp: 1, nextRunAt: 1 });

export default mongoose.model("FollowUpSchedule", FollowUpScheduleSchema);