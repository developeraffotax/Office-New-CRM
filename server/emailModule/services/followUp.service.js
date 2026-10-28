// ai/services/followUp.service.js
import FollowUpSchedule from "../models/FollowUpSchedule.js";

/**
 * Restart the countdown after a manual reply:
 * nextRunAt = now + frequencyDays. No-op if there's no active schedule.
 * Never throws, so callers (e.g. the reply controller) can't fail because of it.
 */
export async function restartFollowUpTimer({ companyName, threadId }) {
  try {
    await FollowUpSchedule.updateOne(
      { companyName, threadId, status: "active" },
      [
        {
          $set: {
            nextRunAt: {
              $add: [new Date(), { $multiply: ["$frequencyDays", 86400000] }],
            },
          },
        },
      ],
    );
  } catch (err) {
    console.error("restartFollowUpTimer failed:", err);
  }
}

/**
 * Stop follow-ups, e.g. when the client replies.
 * Never throws, for the same reason.
 */
export async function stopFollowUps({ companyName, threadId, reason = "client_replied" }) {
  try {
    await FollowUpSchedule.updateOne(
      { companyName, threadId, status: { $in: ["active", "paused"] } },
      { $set: { status: "stopped", stopReason: reason } },
    );
  } catch (err) {
    console.error("stopFollowUps failed:", err);
  }
}