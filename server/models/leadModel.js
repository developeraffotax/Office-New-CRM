import mongoose from "mongoose";
import { generateRef } from "../utils/generateRef.js";

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
    leadCreatedAt: {
      type: Date,
      default: Date.now,
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


     sent: {
      type: Number,
      default: 0,
    },


    received: {
      type: Number,
      default: 0,
    },

    leadRef: { type: String, unique: true },
  },
  { timestamps: true }
);


leadSchema.pre("save", async function (next) {
  if (this.leadRef) return next();
  this.leadRef = await generateRef("L", "lead");
  next();
});

export default mongoose.model("Lead", leadSchema);
