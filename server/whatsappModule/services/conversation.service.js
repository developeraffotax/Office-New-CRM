 
import Conversation    from "../models/Conversation.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
 
import logger          from "../utils/logger.js";

 

 
 
/** Paginated inbox query */
export const getConversations = async ({ status, userId, page = 1, limit = 20, search } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (search) {
    filter.$or = [
      { phone:       { $regex: search, $options: "i" } },
      { profileName: { $regex: search, $options: "i" } },
    ];
  }

  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email")
      .populate("lastMessageId")
      .lean(),
    Conversation.countDocuments(filter),
  ]);

  return { conversations, total, page, limit, pages: Math.ceil(total / limit) };
};
 

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — CONVERSATION HELPERS
   ═══════════════════════════════════════════════════════════════ */

/** Mark a conversation as read by a specific agent */
export const markConversationRead = async (conversationId, userId) => {
  const now = new Date();

  // Replace existing readBy entry for this user atomically
  await Conversation.updateOne(
    { _id: conversationId },
    { $pull: { readBy: { userId } } }
  );
  await Conversation.updateOne(
    { _id: conversationId },
    { $push: { readBy: { userId, lastReadAt: now } } }
  );


};

/** Assign a conversation to an agent */
export const assignConversation = async (conversationId, agentId, assignedBy) => {
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { userId: agentId, status: "progress" } },
    { new: true }
  ).populate("userId", "name email");

  if (!conversation) throw new Error("Conversation not found");



  return conversation;
};

/** Mark a conversation as completed */
export const resolveConversation = async (conversationId, resolvedBy) => {
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { status: "completed" } },
    { new: true }
  );

  if (!conversation) throw new Error("Conversation not found");



  return conversation;
};












 