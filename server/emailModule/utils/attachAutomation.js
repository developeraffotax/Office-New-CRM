// emailModule/utils/attachAutomation.js
import FollowUpSchedule from "../models/FollowUpSchedule.js";
import PendingAutoEmail from "../models/PendingAutoEmail.js";

const toState = (status, pending) => {
  if (status === "failed") return "failed";
  if (status === "active") return pending > 0 ? "approval" : "active";
  if (status === "paused") return "paused";
  return "off"; // stopped / completed
};

// One query for the whole page of threads (plus one small aggregate for pending drafts)
export async function attachAutomation(threads = []) {
  if (!threads.length) return threads;

  const schedules = await FollowUpSchedule.find({
    companyName: { $in: [...new Set(threads.map((t) => t.companyName))] }, // companyName first = uses the unique index
    threadId: { $in: threads.map((t) => t.threadId) },
  })
    .select(
      "companyName threadId status stopReason lastError autoReply autoFollowUp frequencyDays maxFollowUps sentCount maxAutoReplies replyCount nextRunAt",
    )
    .lean();

  const pendingRows = schedules.length
    ? await PendingAutoEmail.aggregate([
        { $match: { scheduleId: { $in: schedules.map((s) => s._id) }, status: "pending" } },
        { $group: { _id: "$scheduleId", n: { $sum: 1 } } },
      ])
    : [];

  const pendingBy = new Map(pendingRows.map((r) => [String(r._id), r.n]));
  const scheduleBy = new Map(schedules.map((s) => [`${s.companyName}:${s.threadId}`, s]));

  return threads.map((t) => {
    const thread = typeof t.toObject === "function" ? t.toObject() : t;
    const s = scheduleBy.get(`${thread.companyName}:${thread.threadId}`);
    if (!s) return { ...thread, automation: { state: "off" } };

    const pending = pendingBy.get(String(s._id)) || 0;
    return {
      ...thread,
      automation: {
        state: toState(s.status, pending),
        status: s.status,
        stopReason: s.stopReason,
        lastError: s.lastError,
        autoReply: s.autoReply,
        autoFollowUp: s.autoFollowUp,
        frequencyDays: s.frequencyDays,
        maxFollowUps: s.maxFollowUps,
        sentCount: s.sentCount,
        replyCount: s.replyCount,
        maxAutoReplies: s.maxAutoReplies,
        nextRunAt: s.nextRunAt,
        pending,
      },
    };
  });
}