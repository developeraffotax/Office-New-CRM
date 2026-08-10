// models/activityLogModel.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true,   enum: ["Lead", "Ticket", ] }, // "Lead", "Ticket", ...
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true,   },
    action: { type: String, required: true }, // "created" | "updated" | "status_changed" | "deleted"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changes: [
      {
        field: String,
        from: mongoose.Schema.Types.Mixed,
        to: mongoose.Schema.Types.Mixed,
      },
    ],
    message: { type: String }, // human-readable summary for the activity feed UI
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true } // createdAt IS your "when"
);

activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);