import mongoose from "mongoose";

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
    },
    yearEnd: {
      type: Date,
    },
    jobDeadline: {
      type: Date,
    },
    workDeadline: {
      type: Date,
    },
    hours: {
      type: String,
    },
    fee: {
      type: String,
    },
    jobStatus: {
      type: String,
      default: "progress",
    },
    notes: {
      type: String,
    },
    subscription: {
      type: String,
    },
    lead: {
      type: String,
    },
    jobHolder: {
      type: String,
    },
  },
  { timestamps: true }
);

// Client Schema
const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    regNumber: {
      type: String,
    },
    companyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    totalHours: {
      type: Number,
    },
    currentDate: {
      type: String,
    },
    source: {
      type: String,
    },
    clientType: {
      type: String,
    },
    country: {
      type: String,
    },
    fee: {
      type: String,
    },
    ctLogin: {
      type: String,
    },
    pyeLogin: {
      type: String,
    },
    trLogin: {
      type: String,
    },
    vatLogin: {
      type: String,
    },
    authCode: {
      type: String,
    },
    utr: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    job: [jobSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
