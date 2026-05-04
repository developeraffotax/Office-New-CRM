import mongoose from "mongoose";

const SignatureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Added company field to scope signatures
    company: {
      type: String,
      required: true,
      enum: ["affotax", "outsource"],
      lowercase: true,
    },
    html: { type: String, required: true },
    // tags: [{ type: String, trim: true }],
    is_default: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Updated logic: Only clear defaults within the same company
SignatureSchema.pre("save", async function (next) {
  if (this.is_default) {
    await this.constructor.updateMany(
      {
        _id: { $ne: this._id },
        company: this.company, // Only clear others in 'affotax' if this is 'affotax'
      },
      { is_default: false },
    );
  }
  next();
});

export default mongoose.model("Signature", SignatureSchema);
