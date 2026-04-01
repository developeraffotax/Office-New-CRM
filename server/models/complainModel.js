import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
    },
    client: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    assign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    errorType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lable",
    },
    solution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lable",
    },
    points: {
      type: Number,
    },
    note: {
      type: String,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    entityType: {
      type: String,
      enum: ["task", "job"],
    },

    entityRef: {
      type: String,
    },

    task: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },


  },
  { timestamps: false },
);

export default mongoose.model("Complaint", complaintSchema);
