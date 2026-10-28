// controllers/followUp.controller.js
import EmailThread from "../models/EmailThread.js";
import FollowUpSchedule from "../models/FollowUpSchedule.js";

const addDays = (d) => new Date(Date.now() + d * 86400000);

export async function upsertFollowUp(req, res) {
  try {
    const { companyName, threadId, frequencyDays, maxFollowUps = 3, customInstructions = "", projectId = null } = req.body;

    const freq = Number(frequencyDays);
    if (!Number.isInteger(freq) || freq < 1 || freq > 60) {
      return res.status(400).json({ success: false, message: "frequencyDays must be 1-60" });
    }

    const thread = await EmailThread.findOne({ companyName, threadId })
      .select("_id lastMessageBy").lean();
    if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });
    if (thread.lastMessageBy !== "me") {
      return res.status(400).json({ success: false, message: "Client replied last. Reply first, then enable follow-ups." });
    }

    const existing = await FollowUpSchedule.findOne({ companyName, threadId }).select("status").lean();
    const keepProgress = existing && ["active", "paused"].includes(existing.status);

    const set = {
      emailThreadId: thread._id,
      status: "active",
      stopReason: "",
      failCount: 0,
      lastError: "",
      frequencyDays: freq,
      maxFollowUps: Number(maxFollowUps),
      customInstructions: String(customInstructions).slice(0, 800),
      projectId,
      nextRunAt: addDays(freq), // first follow-up = frequency from now
      createdBy: req.user.user._id,
      createdByName: req.user.user.name,
    };
    if (!keepProgress) set.sentCount = 0; // re-enabling after stop/complete starts fresh

    const schedule = await FollowUpSchedule.findOneAndUpdate(
      { companyName, threadId },
      { $set: set },
      { upsert: true, new: true },
    );
    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getFollowUp(req, res) {
  const { companyName, threadId } = req.query;
  const schedule = await FollowUpSchedule.findOne({ companyName, threadId }).lean();
  res.json({ success: true, schedule });
}

export async function setFollowUpStatus(req, res) {
  const { companyName, threadId, action } = req.body; // "pause" | "resume" | "cancel"
  const s = await FollowUpSchedule.findOne({ companyName, threadId });
  if (!s) return res.status(404).json({ success: false, message: "Not found" });

  if (action === "pause") s.status = "paused";
  else if (action === "resume") { s.status = "active"; s.nextRunAt = addDays(s.frequencyDays); }
  else if (action === "cancel") { s.status = "stopped"; s.stopReason = "cancelled"; }
  else return res.status(400).json({ success: false, message: "Invalid action" });

  await s.save();
  res.json({ success: true, schedule: s });
}