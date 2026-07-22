import mongoose from "mongoose";
import { generateRef } from "../../utils/generateRef.js";


const labelSchema = new mongoose.Schema({
  name: { type: String },
  color: { type: String },
});


const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    template: {
      type: String,
    },
    category: {
      type: String,
    },

     label: labelSchema,

    templateRef: { type: Number, unique: true },
    userList: [Object],
  },
  { timestamps: true }
);


templateSchema.pre("save", async function (next) {
  if (this.templateRef) return next();
  this.templateRef = await generateRef("template");
  next();
});


export default mongoose.model("templates", templateSchema);
