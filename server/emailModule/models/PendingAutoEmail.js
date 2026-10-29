// models/PendingAutoEmail.js (new)
import mongoose from "mongoose";

const PendingAutoEmailSchema = new mongoose.Schema(
  {
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "FollowUpSchedule", required: true },
    companyName: { type: String, required: true },
    threadId: { type: String, required: true },
    subject: String,
    kind: { type: String, enum: ["reply", "followup"], required: true },
    followUpNumber: { type: Number, default: 0 },

    to: String,
    draftBody: { type: String, required: true }, // what the AI wrote
    finalBody: String, // what was actually sent (after admin edits)
    basedOnMessageId: { type: String, required: true }, // Gmail id of the last message when drafted

    status: {
      type: String,
      enum: ["pending", "approved", "sent", "rejected", "stale"],
      default: "pending",
    },
    decidedBy: mongoose.Schema.Types.ObjectId,
    decidedByName: String,
    decidedAt: Date,
    sentMessageId: String,
    error: String,
  },
  { timestamps: true },
);

PendingAutoEmailSchema.index({ status: 1, createdAt: -1 });
// followUpNumber is part of the key so a rejected follow-up #1 doesn't block #2 on the same message
PendingAutoEmailSchema.index(
  { scheduleId: 1, kind: 1, basedOnMessageId: 1, followUpNumber: 1 },
  { unique: true },
);

export default mongoose.model("PendingAutoEmail", PendingAutoEmailSchema);