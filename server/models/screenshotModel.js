import mongoose from "mongoose";

const ActiveWindowSchema = new mongoose.Schema(
  {
    title: { type: String },
    application: { type: String },
  },
  { _id: false } // prevent creating a separate _id for subdocument
);

const ActivitySummarySchema = new mongoose.Schema(
  {
    keyboardCount: { type: Number, default: 0 },
    mouseCount: { type: Number, default: 0 },
    overallActivityPercent: { type: Number, default: 0 }, // 0–100%
    keyboardActivityPercent: { type: Number, default: 0 },
    mouseActivityPercent: { type: Number, default: 0 },
    period: { type: String }, // e.g. "5min", "hour", "day"
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { _id: false } // prevent separate _id for subdocument
);

const ScreenshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", index: true },

    timestamp: { type: Date, index: true },

    s3Key: String,
    s3Url: String,

    activeWindow: { type: ActiveWindowSchema },
    activity: { type: ActivitySummarySchema },
  },
  { timestamps: true }
);
export default mongoose.model("Screenshot", ScreenshotSchema);
