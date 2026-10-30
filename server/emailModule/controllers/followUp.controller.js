// controllers/followUp.controller.js
import EmailThread from "../models/EmailThread.js";
import FollowUpSchedule from "../models/FollowUpSchedule.js";
import PendingAutoEmail from "../models/PendingAutoEmail.js";
import { computeFirstRun, isValidZone } from "../utils/followUpTime.js";
import mongoose from "mongoose"; // add if missing
import AiProject from "../../aiModule/models/aiProject.js"; // adjust path


const addDays = (d) => new Date(Date.now() + d * 86400000);

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const bad = (res, message) => res.status(400).json({ success: false, message });

export async function upsertFollowUp(req, res) {
  try {
    const {
      companyName,
      threadId,
      autoReply = false,
      autoFollowUp = false,
      requireApproval = true,
      frequencyDays = 5,
      maxFollowUps = 3,
      startDate = "",
      sendTime = "09:00",
      timezone = "UTC",
      customInstructions = "",
      projectId = null,
    } = req.body;

    if (!autoReply && !autoFollowUp) return bad(res, "Pick at least one: auto-reply or follow-up");

    const cfg = {
      frequencyDays: Number(frequencyDays),
      maxFollowUps: Number(maxFollowUps),
      startDate: startDate || "",
      sendTime,
      timezone,
    };

    if (autoFollowUp) {
      if (!Number.isInteger(cfg.frequencyDays) || cfg.frequencyDays < 1 || cfg.frequencyDays > 60)
        return bad(res, "frequencyDays must be 1-60");
      if (!Number.isInteger(cfg.maxFollowUps) || cfg.maxFollowUps < 1 || cfg.maxFollowUps > 10)
        return bad(res, "maxFollowUps must be 1-10");
      if (!TIME_RE.test(sendTime)) return bad(res, "sendTime must be HH:mm");
      if (!isValidZone(timezone)) return bad(res, "Invalid timezone");
      if (cfg.startDate && !DATE_RE.test(cfg.startDate)) return bad(res, "startDate must be YYYY-MM-DD");
    }

        const cleanProjectId = projectId || null;
    if (cleanProjectId) {
      if (!mongoose.isValidObjectId(cleanProjectId)) return bad(res, "Invalid project");

      const project = await AiProject.findById(cleanProjectId).select("companyName").lean();
      if (!project) return bad(res, "Project not found");
      // stops an Affotax project's knowledge/signature from being used on Outsource emails
      if ((project.companyName || "").toLowerCase() !== String(companyName).toLowerCase()) {
        return bad(res, "Project belongs to a different company");
      }
    }

    const thread = await EmailThread.findOne({ companyName, threadId })
      .select("_id lastMessageBy")
      .lean();
    if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });

    // The follow-up clock only runs while WE sent the last message.
    // If the client wrote last, it starts after our next reply (restartFollowUpTimer).
    let nextRunAt = null;
    if (autoFollowUp && thread.lastMessageBy === "me") {
      nextRunAt = computeFirstRun(cfg);
      if (nextRunAt <= new Date()) return bad(res, "Start date/time is in the past");
    }

    const existing = await FollowUpSchedule.findOne({ companyName, threadId }).select("status").lean();
    const keepProgress = existing && ["active", "paused"].includes(existing.status);

    const set = {
      emailThreadId: thread._id,
      status: "active",
      stopReason: "",
      failCount: 0,
      lastError: "",
      autoReply: !!autoReply,
      autoFollowUp: !!autoFollowUp,
      requireApproval: !!requireApproval,
      enabledAt: new Date(),
      ...(autoFollowUp ? cfg : {}),
      nextRunAt,
      customInstructions: String(customInstructions).slice(0, 800),
      projectId: cleanProjectId,
      createdBy: req.user.user._id,
      createdByName: req.user.user.name,
    };
    if (!keepProgress) {
      set.sentCount = 0;
      set.replyCount = 0;
    }

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

  let pending = 0;
  let project = null;
  if (schedule) {
    pending = await PendingAutoEmail.countDocuments({ scheduleId: schedule._id, status: "pending" });
    if (schedule.projectId) {
      project = await AiProject.findById(schedule.projectId).select("name companyName").lean();
    }
  }

  res.json({
    success: true,
    schedule,
    pending,
    project,
    projectMissing: !!schedule?.projectId && !project, // linked project was deleted
  });
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