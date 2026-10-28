// ai/workers/followUp.worker.js

import { Worker } from "bullmq";
import FollowUpSchedule from "../../models/FollowUpSchedule.js";
 import { fetchThreadMessages, getActionType } from "../../../aiModule/utils/utils.js";
import { REPLY } from "../../../aiModule/constants.js";
import { connection } from "../../../utils/ioredis.js";
import { generateEmailDraft } from "../../../aiModule/services/aiEmail.service.js";
import { FOLLOWUP_QUEUE, followUpQueue } from "../queues/followUp.queue.js";
import { sendThreadEmail } from "../../services/sendThreadEmail.service.js";

const LEASE_MS = 30 * 60 * 1000; // if a run crashes, it retries after this
const MAX_FAILS = 3;
const addDays = (d) => new Date(Date.now() + d * 86400000);

const stop = (id, status, stopReason) =>
  FollowUpSchedule.updateOne({ _id: id }, { $set: { status, stopReason } });

const escapeHtml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const toHtml = (text) => escapeHtml(text).replace(/\n/g, "<br>");

async function sweep() {
  const due = await FollowUpSchedule.find({
    status: "active",
    nextRunAt: { $lte: new Date() },
  })
    .select("_id sentCount")
    .limit(100)
    .lean();

  if (!due.length) return;

  await followUpQueue.addBulk(
    due.map((s) => ({
      name: "send",
      data: { scheduleId: String(s._id) },
      opts: {
        jobId: `fu-${s._id}-${s.sentCount}`, // dedupes double-enqueue
        removeOnComplete: true,
        removeOnFail: true,
      },
    })),
  );
}

async function sendFollowUp({ scheduleId }) {
  const now = new Date();

  // 1. Atomic claim: only one worker wins, and nextRunAt becomes a lease
  const schedule = await FollowUpSchedule.findOneAndUpdate(
    { _id: scheduleId, status: "active", nextRunAt: { $lte: now } },
    { $set: { nextRunAt: new Date(now.getTime() + LEASE_MS) } },
    { new: true },
  );
  if (!schedule) return; // paused, stopped, or already handled

  try {
    // 2. Fresh Gmail state (don't trust our DB alone)
    const messages = await fetchThreadMessages(schedule.threadId, schedule.companyName);
    if (!messages.length) return stop(schedule._id, "stopped", "thread_not_found");
    if (getActionType(messages) === REPLY) return stop(schedule._id, "stopped", "client_replied");

    const last = messages[messages.length - 1]; // it's ours (SENT)
    const n = schedule.sentCount + 1;

    // 3. Generate. The hint goes FIRST because custom instructions are capped at 800 chars
    const hint = `This is automated follow-up ${n} of ${schedule.maxFollowUps}. Keep it shorter than earlier follow-ups and don't repeat them.${
      n === schedule.maxFollowUps ? " This is the last one; politely close the loop." : ""
    }\n`;
    const draft = await generateEmailDraft({
      messages,
      companyName: schedule.companyName,
      projectId: schedule.projectId,
      customInstructions: hint + (schedule.customInstructions || ""),
    });

    // 4. Send, in-thread
    const subject = /^re:/i.test(last.subject) ? last.subject : `Re: ${last.subject}`;
    await sendThreadEmail({
      companyName: schedule.companyName,
      threadId: schedule.threadId,
      to: last.to,
      cc: last.cc || undefined,
      html: toHtml(draft.body), // <-- adjust to your AI output shape
      quotedHtml: "",
      headers: {
        Subject: subject,
        "In-Reply-To": last.messageId,
        References: [last.references, last.messageId].filter(Boolean).join(" "),
      },
      attachments: [],
      userName: schedule.createdByName || "Auto Follow-up",
      sentFrom: "CRM-AutoFollowUp",
    });

    // 5. Finalize
    const done = n >= schedule.maxFollowUps;
    await FollowUpSchedule.updateOne(
      { _id: schedule._id },
      {
        $set: {
          sentCount: n,
          lastRunAt: new Date(),
          failCount: 0,
          lastError: "",
          nextRunAt: addDays(schedule.frequencyDays),
          ...(done ? { status: "completed", stopReason: "max_reached" } : {}),
        },
        $push: { history: { sentAt: new Date() } },
      },
    );
  } catch (err) {
    console.error("[followup-worker] send failed:", err);
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

export function startFollowUpWorker() {
  const worker = new Worker(
    FOLLOWUP_QUEUE,
    async (job) => (job.name === "sweep" ? sweep() : sendFollowUp(job.data)),
    {
      connection,
      concurrency: 2,
      // limiter: { max: 10, duration: 60_000 }, // optional: cap sends/min for Gmail + OpenAI quotas
    },
  );

  // "error" fires on Redis connection problems; without a listener it can crash the process
  worker.on("error", (err) => console.error("[followup-worker] error:", err));
  worker.on("failed", (job, err) =>
    console.error(`[followup-worker] job ${job?.id} failed:`, err.message),
  );

  return worker;
}