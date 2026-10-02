import mongoose from "mongoose";

const googleSheetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // Normalized https://docs.google.com/spreadsheets/... URL
    embedUrl: { type: String, required: true, trim: true },
    // Users who can see this sheet in their sidebar
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    // Inactive sheets are hidden from users (admins still see them)
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true },
);

googleSheetSchema.index({ users: 1, isActive: 1 });

export default mongoose.model("GoogleSheet", googleSheetSchema);