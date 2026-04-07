import mongoose from "mongoose";
import { generateRef } from "../utils/generateRef.js";

const hrSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    
    hrTaskRef: { type: Number, unique: true },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
    },
    hrRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hrRole",
    },
    category: {
      type: String,
      trim: true,
    },
    software: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    productLink: {   // used to store the notion link
      type: String,
      trim: true,
    },

    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        status: {
          type: String,
          default: "No",
        },
      },
    ],


  },
  { timestamps: true }
);


hrSchema.pre("save", async function (next) {
  if (this.hrTaskRef) return next();
  this.hrTaskRef = await generateRef("hr");
  next();
});



export default mongoose.model("HR", hrSchema);
