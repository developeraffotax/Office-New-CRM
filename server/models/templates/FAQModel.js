import mongoose from "mongoose";

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FAQ", FAQSchema);
