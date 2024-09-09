import mongoose from "mongoose";

const lableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String },
    type: { type: String, default: "job" },
  },
  { timestamps: true }
);

export default mongoose.model("Lable", lableSchema);
