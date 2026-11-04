import mongoose from "mongoose";

const ASSIGNEE_MODES = ["fixed", "jobHolder", "leadUser", "unassigned"];

const templateStepSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" }, // sanitized HTML
  // fixed      -> always `assignee`
  // jobHolder  -> whoever is job.jobHolder on the job it is applied to
  // leadUser   -> whoever is job.leadUser on the job it is applied to
  assigneeMode: { type: String, enum: ASSIGNEE_MODES, default: "unassigned" },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "Users", default: null },
  dueOffsetDays: { type: Number, default: null, min: 0 }, // days after the workflow is applied
});

const workflowTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Bookkeeping – Monthly"
    jobType: { type: String, required: true, trim: true }, // matches job.jobName
    description: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 }, // bumped on every edit
    steps: { type: [templateStepSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

workflowTemplateSchema.index({ jobType: 1, isActive: 1 });

workflowTemplateSchema.pre("validate", function (next) {
  for (const s of this.steps) {
    if (s.assigneeMode !== "fixed") s.assignee = null;
    if (s.assigneeMode === "fixed" && !s.assignee) {
      return next(new Error(`Step "${s.title}" needs a user when assignee mode is "fixed"`));
    }
  }
  next();
});

export default mongoose.model("WorkflowTemplate", workflowTemplateSchema);