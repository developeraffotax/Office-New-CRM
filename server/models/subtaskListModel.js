// models/SubtaskList.js
import mongoose from "mongoose";

const subtaskListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Accounts"
    },
    items: [
      {
        title: { type: String, required: true }, // e.g. "Final Report"
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SubtaskList || mongoose.model("SubtaskList", subtaskListSchema);


 