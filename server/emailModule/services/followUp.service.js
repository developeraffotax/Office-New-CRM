// ai/services/followUp.service.js
import FollowUpSchedule from "../models/FollowUpSchedule.js";
import PendingAutoEmail from "../models/PendingAutoEmail.js";
import { sendThreadEmail } from "./sendThreadEmail.service.js";
import { followUpQueue } from "../jobs/queues/followUp.queue.js";
import { computeNextRun } from "../utils/followUpTime.js";
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";

/* ---------------- helpers ---------------- */

const escapeHtml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const toHtml = (text) => escapeHtml(text).replace(/\n/g, "<br>");

const headerValue = (headers = [], name) =>
  headers.find((h) => h.name?.toLowerCase() === name)?.value || "";

// Never auto-reply to bots, bounces, mailing lists or other auto-responders (prevents mail loops)
export function isAutomatedSender(fromEmail = "", headers = []) {
  const autoSubmitted = headerValue(headers, "auto-submitted").toLowerCase();
  const precedence = headerValue(headers, "precedence").toLowerCase();
  return Boolean(
    /no-?reply|donotreply|mailer-daemon|postmaster/i.test(fromEmail) ||
      (autoSubmitted && autoSubmitted !== "no") ||
      ["bulk", "list", "junk", "auto_reply"].includes(precedence) ||
      headerValue(headers, "list-id") ||
      headerValue(headers, "x-autoreply") ||
      headerValue(headers, "x-autorespond"),
  );
}

const supersedePending = (scheduleId) =>
  PendingAutoEmail.updateMany({ scheduleId, status: "pending" }, { $set: { status: "stale" } });

/* ---------------- called from the reply controller ---------------- */

// Our side just sent something (manual or automatic): re-arm the follow-up clock.
// Never throws, so it can't fail the request that called it.
export async function restartFollowUpTimer({ companyName, threadId }) {
  try {
    const s = await FollowUpSchedule.findOne({ companyName, threadId, status: "active" }).lean();
    if (!s) return;

    await supersedePending(s._id); // a human reply makes any waiting draft obsolete

    if (s.autoFollowUp && s.sentCount < s.maxFollowUps) {
      await FollowUpSchedule.updateOne({ _id: s._id }, { $set: { nextRunAt: computeNextRun(s) } });
    }
  } catch (err) {
    console.error("restartFollowUpTimer failed:", err);
  }
}

/* ---------------- called from persistThread ---------------- */

// A new client email arrived. Claims it atomically (once per message), resets the follow-up
// clock, and enqueues the auto-reply. Never throws.
export async function handleInboundMessage({ companyName, threadId, messageId, messageDate, fromEmail, headers }) {
  try {
    const s = await FollowUpSchedule.findOneAndUpdate(
      {
        companyName,
        threadId,
        status: "active",
        lastInboundMessageId: { $ne: messageId },
        enabledAt: { $lt: messageDate }, // ignore mail that predates the automation
      },
      { $set: { lastInboundMessageId: messageId, nextRunAt: null, sentCount: 0 } },
      { new: true },
    );
    if (!s) return;

    await supersedePending(s._id);

    if (!s.autoReply || s.replyCount >= s.maxAutoReplies) return;
    if (isAutomatedSender(fromEmail, headers)) return;

    await followUpQueue.add(
      "reply",
      { scheduleId: String(s._id), messageId },
      {
        jobId: `reply-${s._id}-${messageId}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  } catch (err) {
    console.error("handleInboundMessage failed:", err);
  }
}


// "Name <a@x.com>, b@x.com" (or an array) -> ["a@x.com", "b@x.com"]
// Matches addresses rather than splitting on commas, so names like "Doe, John" <j@x.com> survive.
const toAddressList = (value) => {
  const text = Array.isArray(value) ? value.join(",") : String(value || "");
  const emails = text.match(/[^\s<>,;"']+@[^\s<>,;"']+/g) || [];
  return [...new Set(emails.map((e) => e.toLowerCase()))];
};


/* ---------------- sending (worker + approval controller) ---------------- */

export async function sendAutoEmail({ schedule, kind, messages, bodyText }) {
  const last = messages[messages.length - 1];
  const subject = /^re:/i.test(last.subject) ? last.subject : `Re: ${last.subject}`;

  // reply: the client wrote last; follow-up: we did
  const to = toAddressList(kind === "reply" ? last.from : last.to);
  if (!to.length) throw new Error("No recipient address found on the last message");
  const cc = kind === "followup" ? toAddressList(last.cc) : [];

  const { gmailMessageId } = await sendThreadEmail({
    companyName: schedule.companyName,
    threadId: schedule.threadId,
    to,
    cc: cc.length ? cc : undefined,
    html: bodyText,
    quotedHtml: "",
    headers: {
      Subject: subject,
      "In-Reply-To": last.messageId,
      References: [last.references, last.messageId].filter(Boolean).join(" "),
    },
    attachments: [],
    // userName: schedule.createdByName || "Automation",
    userName:  "Affotax-AI",
    sentFrom: kind === "reply" ? "CRM-AutoReply" : "CRM-AutoFollowUp",
  });

  return gmailMessageId;
}

// Counts a follow-up (sent or skipped by an admin) and schedules the next one.
export async function advanceFollowUp(schedule, { sent, gmailMessageId = "" }) {
  const n = schedule.sentCount + 1;
  const done = n >= schedule.maxFollowUps;
  const set = {
    sentCount: n,
    lastRunAt: new Date(),
    failCount: 0,
    lastError: "",
    nextRunAt: done ? null : computeNextRun(schedule),
  };
  // follow-up only schedules are finished; with auto-reply on they keep listening for the client
  if (done && !schedule.autoReply) {
    set.status = "completed";
    set.stopReason = "max_reached";
  }
  await FollowUpSchedule.updateOne(
    { _id: schedule._id },
    {
      $set: set,
      ...(sent ? { $push: { history: { kind: "followup", sentAt: new Date(), gmailMessageId } } } : {}),
    },
  );
}

export async function recordAutoSend(schedule, kind, gmailMessageId) {
  if (kind === "followup") return advanceFollowUp(schedule, { sent: true, gmailMessageId });

  await FollowUpSchedule.updateOne(
    { _id: schedule._id },
    {
      $inc: { replyCount: 1 },
      $set: { lastError: "" },
      $push: { history: { kind: "reply", sentAt: new Date(), gmailMessageId } },
    },
  );
  await restartFollowUpTimer({ companyName: schedule.companyName, threadId: schedule.threadId });
}

/* ---------------- approval ---------------- */

export async function createPendingDraft({ schedule, kind, messages, bodyText, followUpNumber = 0 }) {
  const last = messages[messages.length - 1];
  try {
    const draft = await PendingAutoEmail.create({
      scheduleId: schedule._id,
      companyName: schedule.companyName,
      threadId: schedule.threadId,
      subject: last.subject,
      kind,
      followUpNumber,
      to: kind === "reply" ? last.from : last.to,
      draftBody: bodyText,
      basedOnMessageId: last.id,
    });

    try {
      const io = await getSocketEmitter();
      io.emit("autoemail:pending", {
        id: String(draft._id),
        kind,
        subject: draft.subject,
        companyName: draft.companyName,
      });
    } catch (err) {
      console.error("approval notify failed:", err.message);
    }
    return draft;
  } catch (err) {
    if (err.code === 11000) return null; // same draft already exists
    throw err;
  }
}