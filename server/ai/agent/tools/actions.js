// ai/agent/tools/actions.js
// Write actions. The AI can only PROPOSE them (stored as a pending AiAction); a person confirms in the UI,
// and only then does execute() run, with that person's permissions re-checked.
import { AiAction } from "../../models/agent.models.js";
import { ToolError } from "../toolkit.js";

// Register your actions here. Example:
//
// reassign_job: {
//   description: "Reassign a job to another user.",
//   parameters: {
//     type: "object",
//     properties: { jobId: { type: "string" }, userId: { type: "string" } },
//     required: ["jobId", "userId"],
//   },
//   roles: ["admin"],
//   summarize: (a) => `Reassign job ${a.jobId} to user ${a.userId}`,
//   execute: async (a, user) => jobService.reassign(a.jobId, a.userId, user), // ← your existing code
// },
export const ACTIONS = {};

export function actionTools() {
  return Object.entries(ACTIONS).map(([name, a]) => ({
    name: `propose_${name}`,
    description: `${a.description} This only PROPOSES the change. A person must confirm it before anything happens.`,
    parameters: a.parameters,
    async execute(input, ctx) {
      if (a.roles && !a.roles.includes(ctx.user.role)) throw new ToolError("Not allowed.");
      const doc = await AiAction.create({ userId: ctx.user._id, action: name, input, summary: a.summarize(input) });
      ctx.emit("proposal", { id: String(doc._id), summary: doc.summary });
      return { status: "awaiting_confirmation", proposalId: String(doc._id), summary: doc.summary };
    },
  }));
}

/** Called by the confirm / cancel endpoints. Only the person who asked can resolve it. */
export async function resolveAction(id, user, decision) {
  if (decision === "cancel") {
    const doc = await AiAction.findOneAndUpdate({ _id: id, userId: user._id, status: "pending" }, { status: "cancelled" }, { new: true });
    if (!doc) throw new ToolError("This proposal is no longer pending.");
    return doc;
  }
  // claim it atomically so a double click can't run it twice
  const doc = await AiAction.findOneAndUpdate({ _id: id, userId: user._id, status: "pending" }, { status: "running" }, { new: true });
  if (!doc) throw new ToolError("This proposal is no longer pending.");
  const a = ACTIONS[doc.action];
  try {
    if (!a) throw new Error("Action no longer exists");
    if (a.roles && !a.roles.includes(user.role)) throw new Error("Not allowed");
    const result = await a.execute(doc.input, user);
    doc.status = "done";
    doc.result = result ?? null;
  } catch (err) {
    doc.status = "failed";
    doc.error = err.message;
  }
  await doc.save();
  return doc;
}
