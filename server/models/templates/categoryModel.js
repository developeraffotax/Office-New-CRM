import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("templateCategories", categorySchema);
