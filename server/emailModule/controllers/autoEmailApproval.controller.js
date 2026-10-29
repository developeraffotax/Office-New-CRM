// ai/controllers/autoEmailApproval.controller.js
import { fetchThreadMessages } from "../../aiModule/utils/utils.js";
import { isAdmin } from "../../utils/checkPermission.js";
import FollowUpSchedule from "../models/FollowUpSchedule.js";
import PendingAutoEmail from "../models/PendingAutoEmail.js";
 
import { advanceFollowUp, recordAutoSend, sendAutoEmail } from "../services/followUp.service.js";




 

const forbid = (res) => res.status(403).json({ success: false, message: "Not allowed" });
const conflict = (res, message) => res.status(409).json({ success: false, message });


export async function listPending(req, res) {
  if (!isAdmin(req)) return forbid(res);
  const items = await PendingAutoEmail.find({ status: "pending" }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, items });
}

export async function approvePending(req, res) {
  const user = req.user.user;
  if (!isAdmin(req)) return forbid(res);

  // Atomic claim: a double click or two admins can't send it twice
  const draft = await PendingAutoEmail.findOneAndUpdate(
    { _id: req.params.id, status: "pending" },
    { $set: { status: "approved", decidedBy: user._id, decidedByName: user.name, decidedAt: new Date() } },
    { new: true },
  );
  if (!draft) return conflict(res, "Already handled");

  const release = (error) =>
    PendingAutoEmail.updateOne({ _id: draft._id }, { $set: { status: "pending", error } });

  try {
    const schedule = await FollowUpSchedule.findById(draft.scheduleId);
    const messages = await fetchThreadMessages(draft.threadId, draft.companyName);
    const last = messages[messages.length - 1];

    // The thread moved on since the draft was written: don't send stale text
    if (!schedule || schedule.status !== "active" || !last || last.id !== draft.basedOnMessageId) {
      await PendingAutoEmail.updateOne({ _id: draft._id }, { $set: { status: "stale" } });
      return conflict(res, "Thread changed since this draft was created. Draft discarded.");
    }

    const bodyText = (req.body.body || draft.draftBody).trim();
    const gmailMessageId = await sendAutoEmail({ schedule, kind: draft.kind, messages, bodyText });

    await PendingAutoEmail.updateOne(
      { _id: draft._id },
      { $set: { status: "sent", finalBody: bodyText, sentMessageId: gmailMessageId, error: "" } },
    );
    await recordAutoSend(schedule, draft.kind, gmailMessageId);

    res.json({ success: true });
  } catch (err) {
    console.error("approvePending failed:", err);
    await release(err.message?.slice(0, 300) || "send failed"); // back to pending so it can be retried
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function rejectPending(req, res) {
  const user = req.user.user;
  if (!isAdmin(req)) return forbid(res);

  const draft = await PendingAutoEmail.findOneAndUpdate(
    { _id: req.params.id, status: "pending" },
    { $set: { status: "rejected", decidedBy: user._id, decidedByName: user.name, decidedAt: new Date() } },
    { new: true },
  );
  if (!draft) return conflict(res, "Already handled");

  // A rejected follow-up counts as used, so the sequence still ends. Reply drafts are simply dropped.
  if (draft.kind === "followup") {
    const schedule = await FollowUpSchedule.findById(draft.scheduleId);
    if (schedule?.status === "active") await advanceFollowUp(schedule, { sent: false });
  }
  res.json({ success: true });
}