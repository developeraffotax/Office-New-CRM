import mongoose from "mongoose";

/*
  Condition tree (stored as plain JSON so groups can nest):

  {
    operator: "AND" | "OR",
    items: [
      { field: "subject", op: "contains", value: "Govt Gateway" },   // leaf
      { operator: "OR", items: [ ...leaves or groups... ] }          // nested group
    ]
  }

  An empty `items` array matches everything (use it for a catch-all rule).
*/

const automationRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    channel: {
      type: String,
      enum: ["email", "whatsapp"],
      required: true,
      index: true,
    },

    enabled: { type: Boolean, default: true },

    // Lower number = evaluated first
    priority: { type: Number, default: 100 },

    // true  -> stop evaluating further rules once this one matches
    // false -> keep going so later rules can still fill in a missing user/category
    stopOnMatch: { type: Boolean, default: true },

    conditions: { type: mongoose.Schema.Types.Mixed, required: true },

    actions: {
      category: { type: String, default: "", trim: true },
      assign: {
        strategy: {
          type: String,
          enum: ["fixed", "round_robin", "random"],
          default: "fixed",
        },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
        currentIndex: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true },
);

automationRuleSchema.index({ channel: 1, enabled: 1, priority: 1 });

export default mongoose.model("AutomationRule", automationRuleSchema);