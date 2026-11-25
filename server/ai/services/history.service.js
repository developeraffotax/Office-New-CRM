// ai/services/history.service.js — saved chats. Every function is scoped to the signed-in user.
import { AiConversation, AiMessage } from "../models/agent.models.js";
import { aiConfig } from "../config.js";

const MAX_CONTEXT_MESSAGES = 20; // how much of the chat the model sees
const MAX_CONTEXT_CHARS = 16_000;
const MAX_MESSAGE_CHARS = 4_000; // a single very long message is clipped when used as context
const STORE_LIMIT = 30_000;

const notFound = () => Object.assign(new Error("Conversation not found"), { status: 404 });
const expiry = () => (aiConfig.historyDays > 0 ? new Date(Date.now() + aiConfig.historyDays * 86_400_000) : undefined);
const titleFrom = (q) => {
  const t = String(q).replace(/\s+/g, " ").trim();
  return t.length > 60 ? `${t.slice(0, 60)}…` : t || "New chat";
};

/** Newest messages that fit the budget, oldest first, starting with a user turn. Pure, so it is easy to test. */
export function windowHistory(rows, { maxMessages = MAX_CONTEXT_MESSAGES, maxChars = MAX_CONTEXT_CHARS, perMessage = MAX_MESSAGE_CHARS } = {}) {
  const picked = [];
  let chars = 0;
  for (let i = rows.length - 1; i >= 0 && picked.length < maxMessages; i--) {
    const text = String(rows[i].content || "").trim();
    if (!text) continue;
    const clipped = text.length > perMessage ? `${text.slice(0, perMessage)} …` : text;
    if (picked.length && chars + clipped.length > maxChars) break;
    chars += clipped.length;
    picked.unshift({ role: rows[i].role, content: clipped });
  }
  while (picked.length && picked[0].role !== "user") picked.shift();
  return picked;
}

/** Open (or create) the conversation, load what the model should remember, and save the new question. */
export async function startTurn({ user, conversationId, question, attachments = [] }) {
  let conversation;
  let history = [];
  let isNew = false;

  if (conversationId) {
    conversation = await AiConversation.findOne({ _id: conversationId, userId: user._id });
    if (!conversation) throw notFound(); // not theirs, or expired: same answer
    const rows = await AiMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_MESSAGES * 2)
      .select("role content")
      .lean();
    history = windowHistory(rows.reverse());
  } else {
    conversation = await AiConversation.create({ userId: user._id, title: titleFrom(question), expiresAt: expiry() });
    isNew = true;
  }

  const expiresAt = expiry();
  await AiMessage.create({
    conversationId: conversation._id,
    userId: user._id,
    role: "user",
    content: String(question).slice(0, STORE_LIMIT),
    attachments: attachments.map((a) => ({ filename: a.filename })),
    expiresAt,
  });
  await AiConversation.updateOne({ _id: conversation._id }, { lastMessageAt: new Date(), ...(expiresAt ? { expiresAt } : {}) });
  return { conversation, history, isNew };
}

export async function saveAssistant({ conversation, user, text, sources = [], files = [], toolsUsed = 0, partial = false }) {
  const expiresAt = expiry();
  await AiMessage.create({
    conversationId: conversation._id,
    userId: user._id,
    role: "assistant",
    content: String(text).slice(0, STORE_LIMIT),
    sources,
    files,
    toolsUsed,
    partial,
    expiresAt,
  });
  await AiConversation.updateOne({ _id: conversation._id }, { lastMessageAt: new Date(), ...(expiresAt ? { expiresAt } : {}) });
}

export async function listConversations(user) {
  const rows = await AiConversation.find({ userId: user._id }).sort({ lastMessageAt: -1 }).limit(50).select("title lastMessageAt").lean();
  return rows.map((c) => ({ id: String(c._id), title: c.title, lastMessageAt: c.lastMessageAt }));
}

export async function getMessages(user, id) {
  const conv = await AiConversation.findOne({ _id: id, userId: user._id });
  if (!conv) throw notFound();
  const rows = await AiMessage.find({ conversationId: conv._id }).sort({ createdAt: 1 }).limit(300).lean();
  return {
    conversation: { id: String(conv._id), title: conv.title },
    messages: rows.map((m) => ({
      id: String(m._id), role: m.role, content: m.content, sources: m.sources, files: m.files,
      attachments: m.attachments, toolsUsed: m.toolsUsed, partial: m.partial, createdAt: m.createdAt,
    })),
  };
}

export async function deleteConversation(user, id) {
  const conv = await AiConversation.findOne({ _id: id, userId: user._id });
  if (!conv) throw notFound();
  await AiMessage.deleteMany({ conversationId: conv._id });
  await AiConversation.deleteOne({ _id: conv._id });
}