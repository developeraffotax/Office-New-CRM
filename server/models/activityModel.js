import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    action: {
      type: String,
      required: true,
      //   enum: ["Create", "Update", "Delete", "View", "Copy" "Other"],
    },
    entity: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
