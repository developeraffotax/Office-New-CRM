
// ai/workers/followUp.worker.js
import { Worker } from "bullmq";
import FollowUpSchedule from "../../models/FollowUpSchedule.js";
import { fetchThreadMessages, getActionType } from "../../../aiModule/utils/utils.js";
import { REPLY } from "../../../aiModule/constants.js";
import { connection } from "../../../utils/ioredis.js";
import { generateEmailDraft } from "../../../aiModule/services/aiEmail.service.js";
import { FOLLOWUP_QUEUE, followUpQueue } from "../queues/followUp.queue.js";
import {
  advanceFollowUp,
  createPendingDraft,
  recordAutoSend,
  sendAutoEmail,
} from "../../services/followUp.service.js";

const LEASE_MS = 30 * 60 * 1000; // if a follow-up run crashes, it retries after this
const MAX_FAILS = 3;

// Keep hints short: custom instructions are capped at 800 chars in total
const REPLY_HINT =
  "Automated reply to the client's latest email. Don't promise anything or quote prices; if a human decision is needed, say the team will follow up.\n";

const stop = (id, stopReason) =>
  FollowUpSchedule.updateOne({ _id: id }, { $set: { status: "stopped", stopReason } });

// client answered: the follow-up sequence starts over the next time WE send something
const disarm = (id) =>
  FollowUpSchedule.updateOne({ _id: id }, { $set: { nextRunAt: null, sentCount: 0 } });

async function sweep() {
  console.log(`[${new Date().toISOString()}] followup-sweeper ran`);

  const due = await FollowUpSchedule.find({
    status: "active",
    autoFollowUp: true,
    nextRunAt: { $lte: new Date() },
  })
    .select("_id sentCount")
    .limit(100)
    .lean();

  if (!due.length) {
    console.log("[followup-sweeper] no schedules due");
    return;
  }

  console.log(`[followup-sweeper] found ${due.length} due schedule(s)`);

  await followUpQueue.addBulk(
    due.map((s) => ({
      name: "send",
      data: { scheduleId: String(s._id) },
      opts: {
        jobId: `fu-${s._id}-${s.sentCount}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    })),
  );
}

/* ---------------- follow-up job ---------------- */

async function sendFollowUp({ scheduleId }) {
  const now = new Date();

  // Atomic claim: only one worker wins, and nextRunAt becomes a lease
  const schedule = await FollowUpSchedule.findOneAndUpdate(
    { _id: scheduleId, status: "active", autoFollowUp: true, nextRunAt: { $lte: now } },
    { $set: { nextRunAt: new Date(now.getTime() + LEASE_MS) } },
    { new: true },
  );
  if (!schedule) return;

  try {
    const messages = await fetchThreadMessages(schedule.threadId, schedule.companyName);
    if (!messages.length) return stop(schedule._id, "thread_not_found");
    // safety net if the webhook lagged: the client answered, so don't follow up
    if (getActionType(messages) === REPLY) return disarm(schedule._id);

    const n = schedule.sentCount + 1;
    const hint = `This is automated follow-up ${n} of ${schedule.maxFollowUps}. Keep it shorter than earlier follow-ups and don't repeat them.${
      n === schedule.maxFollowUps ? " This is the last one; politely close the loop." : ""
    }\n`;

    const draft = await generateEmailDraft({
      messages,
      companyName: schedule.companyName,
      projectId: schedule.projectId,
      customInstructions: hint + (schedule.customInstructions || ""),
      optionNumber: 3,
    });

    if (schedule.requireApproval) {
      await createPendingDraft({
        schedule,
        kind: "followup",
        messages,
        bodyText: draft.content, // <-- adjust to your AI output shape
        followUpNumber: n,
      });
      // pause the clock until an admin decides
      await FollowUpSchedule.updateOne({ _id: schedule._id }, { $set: { nextRunAt: null } });
      return;
    }



    console.log(`THE DRAFT IS THIS ${draft.content}`)

    const gmailMessageId = await sendAutoEmail({
      schedule,
      kind: "followup",
      messages,
      bodyText: draft.content,
    });
    await advanceFollowUp(schedule, { sent: true, gmailMessageId });
  } catch (err) {
    console.error("[followup-worker] follow-up failed:", err);
    const failCount = schedule.failCount + 1;
    await FollowUpSchedule.updateOne(
      { _id: schedule._id },
      {
        $set: {
          failCount,
          lastError: err.message?.slice(0, 300) || "unknown",
          ...(failCount >= MAX_FAILS ? { status: "failed", stopReason: "send_failed" } : {}),
        },
      },
    ); // otherwise the lease expires and it retries in 30 min
  }
}

/* ---------------- auto-reply job ---------------- */

async function sendAutoReply({ scheduleId, messageId }) {
  const schedule = await FollowUpSchedule.findOne({ _id: scheduleId, status: "active", autoReply: true });
  if (!schedule || schedule.replyCount >= schedule.maxAutoReplies) return;

  try {
    const messages = await fetchThreadMessages(schedule.threadId, schedule.companyName);
    const last = messages[messages.length - 1];

    // Only answer the exact email that triggered this job, and only if nobody
    // (a human, or an earlier attempt of this job) has replied in the meantime.
    if (!last || last.id !== messageId || getActionType(messages) !== REPLY) return;

    const draft = await generateEmailDraft({
      messages,
      companyName: schedule.companyName,
      projectId: schedule.projectId,
      customInstructions: REPLY_HINT + (schedule.customInstructions || ""),
      optionNumber: 3
    });

    if (schedule.requireApproval) {
      await createPendingDraft({ schedule, kind: "reply", messages, bodyText: draft.content });
      return;
    }

    const gmailMessageId = await sendAutoEmail({
      schedule,
      kind: "reply",
      messages,
      bodyText: draft.content,
    });
    await recordAutoSend(schedule, "reply", gmailMessageId);
  } catch (err) {
    console.error("[followup-worker] auto-reply failed:", err);
    await FollowUpSchedule.updateOne(
      { _id: schedule._id },
      { $set: { lastError: err.message?.slice(0, 300) || "unknown" } },
    );
    throw err; // let BullMQ retry (3 attempts, exponential backoff)
  }
}

/* ---------------- worker ---------------- */

export function startFollowUpWorker() {
  const worker = new Worker(
    FOLLOWUP_QUEUE,
    async (job) => {
      switch (job.name) {
        case "sweep":
          return sweep();
        case "send":
          return sendFollowUp(job.data);
        case "reply":
          return sendAutoReply(job.data);
        default:
          console.warn(`[followup-worker] unknown job ${job.name}`);
      }
    },
    { connection, concurrency: 2 },
  );

  worker.on("error", (err) => console.error("[followup-worker] error:", err));
  worker.on("failed", (job, err) =>
    console.error(`[followup-worker] job ${job?.id} failed:`, err.message),
  );

  return worker;
}