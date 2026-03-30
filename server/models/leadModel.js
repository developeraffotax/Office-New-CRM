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
      type: String,
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

    wonAt: {
      type: Date,
    },

    lostAt: {
      type: Date,
    },

    leadRef: { type: Number, unique: true },
  },
  { timestamps: true },
);

leadSchema.pre("save", async function (next) {
  if (this.leadRef) return next();
  this.leadRef = await generateRef("lead");
  next();
});

/* ===============================
   Handle Status Changes
   (Works with findByIdAndUpdate)
=============================== */

leadSchema.pre("findOneAndUpdate", function (next) {
  try {
    let update = this.getUpdate();

    if (!update) return next();

    // Ensure $set exists
    if (!update.$set) {
      update.$set = {};
    }

    // Ensure $unset exists
    if (!update.$unset) {
      update.$unset = {};
    }

    // Get status from update
    const status =
      update.status || update.$set.status;

    // Get manually provided timestamps
    const manualWonAt =
      update.wonAt || update.$set.wonAt;

    const manualLostAt =
      update.lostAt || update.$set.lostAt;

    if (!status) {
      this.setUpdate(update);
      return next();
    }

    /* ===============================
       STATUS LOGIC
    =============================== */

    if (status === "won") {

      // Only auto-set if frontend did NOT send wonAt
      if (!manualWonAt) {
        update.$set.wonAt = new Date();
      }

      // Remove lostAt
      update.$unset.lostAt = "";
    }

    if (status === "lost") {

      if (!manualLostAt) {
        update.$set.lostAt = new Date();
      }

      update.$unset.wonAt = "";
    }

    if (status === "progress") {

      update.$unset.wonAt = "";
      update.$unset.lostAt = "";
    }

    this.setUpdate(update);

    next();

  } catch (error) {
    next(error);
  }
});



export default mongoose.model("Lead", leadSchema);
