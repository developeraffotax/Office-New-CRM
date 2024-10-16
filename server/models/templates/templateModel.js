import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    template: {
      type: String,
    },
    category: {
      type: String,
    },
    userList: [Object],
  },
  { timestamps: true }
);

export default mongoose.model("templates", templateSchema);
