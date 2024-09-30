import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    access: [Object],
  },
  { timestamps: true }
);

export default mongoose.model("Roles", roleSchema);
