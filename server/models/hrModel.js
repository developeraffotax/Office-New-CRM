import mongoose from "mongoose";

const hrSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
    },
    category: {
      type: String,
      trim: true,
    },
    software: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        status: {
          type: String,
          enum: ["Yes", "No"],
          default: "No",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("HR", hrSchema);
