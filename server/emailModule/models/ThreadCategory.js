// models/ThreadCategory.js
import mongoose from "mongoose";

const ThreadCategorySchema = new mongoose.Schema(
  {
     

    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    color: {
      type: String, // e.g. "#6366f1" or "indigo-500"
      required: true,
    },

    
  },
  { timestamps: true }
);
 

export default mongoose.model("ThreadCategory", ThreadCategorySchema);
