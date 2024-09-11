import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    users_list: [Object],
    status: {
      type: String,
      default: "processing",
    },
    order: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Projects", projectSchema);
