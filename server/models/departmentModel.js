import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "processing",
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("departments", departmentSchema);
