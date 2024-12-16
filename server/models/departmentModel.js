import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        status: {
          type: String,
          default: "No",
        },
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
