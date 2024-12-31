import mongoose from "mongoose";

const quickListSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      default: "Quick List",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("QuickList", quickListSchema);
