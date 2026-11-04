import mongoose from "mongoose";

export const STEP_STATUSES = ["pending", "in_progress", "done", "blocked", "skipped"];

const stepSchema = new mongoose.Schema(
  {
    templateStepId: { type: mongoose.Schema.Types.ObjectId, default: null }, // for "update from template"
    order: { type: Number, default: 0 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" }, // sanitized HTML
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: STEP_STATUSES, default: "pending" },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "", trim: true, maxlength: 1000 },
    // true once someone edits title/description on this job, so a template sync won't overwrite it
    customized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const jobWorkflowSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true, // one workflow per job
    },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowTemplate", default: null },
    templateName: { type: String, default: "" },
    templateVersion: { type: Number, default: 0 },
    steps: { type: [stepSchema], default: [] },
    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// "my open steps" and bulk reassign
jobWorkflowSchema.index({ "steps.assignee": 1, "steps.status": 1 });

export default mongoose.models.JobWorkflow || mongoose.model("JobWorkflow", jobWorkflowSchema);