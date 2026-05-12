import mongoose from "mongoose";

const SavedFilterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  name: { type: String, required: true },
  page: { type: String, required: true, enum: ["tasks", "jobs", "tickets"] },
  filters: { type: Array, required: true },
}, { timestamps: true });


export default mongoose.model("SavedFilter", SavedFilterSchema);
 