import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    clientName: {
      type: String,
    },
    jobHolder: {
      type: String,
    },
    department: {
      type: String,
    },
    source: {
      type: String,
    },
    brand: {
      type: String,
    },
    lead_Source: {
      type: String,
    },
    followUpDate: {
      type: Date,
    },
    JobDate: {
      type: Date,
    },
    Note: {
      type: String,
    },
    stage: {
      type: String,
    },
    status: {
      type: String,
      default: "progress",
    },
    value: {
      type: String,
    },
    number: {
      type: Number,
    },

    email: {
      type: String
    },


    yearEnd: {
      type: Date,
      
     
    },
    jobDeadline: {
      type: Date,
      
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
