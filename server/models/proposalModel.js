import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
    },
    jobHolder: {
      type: String,
    },
    subject: {
      type: String,
    },
    mail: {
      type: String,
      trim: true,
    },
    jobDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    source: {
      type: String,
    },
    note: {
      type: String,
    },
    propos: {
      type: String,
    },
    lead: {
      type: String,
    },
    client: {
      type: String,
    },
    value: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export default mongoose.model("Proposal", proposalSchema);
