import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
     
     departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "departments" }],
  },
  { timestamps: true }
);

export default mongoose.model("hrProduct", productSchema);