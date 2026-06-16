import Conversation from "../models/WhatsappConversation.js";
import WhatsappMessage from "../models/WhatsappMessage.js";

import logger from "../utils/logger.js";
import { buildWhatsappFilterQuery } from "../utils/utils.js";






export const getConversations = async (req) => {
  const filter = buildWhatsappFilterQuery(req);

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("lastMessageId")
      .lean(),

    Conversation.countDocuments(filter),
  ]);

  return { conversations, pagination: { total, page, limit, pages: Math.ceil(total / limit) }, };
};





export const markConversationRead = async (conversationId, userId) => {
  const conversation = await Conversation.findById( conversationId, "totalInboundMessages", );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const now = new Date();

  const result = await Conversation.updateOne(
    {
      _id: conversationId,
      "readBy.userId": userId,
    },
    {
      $set: {
        "readBy.$.lastReadAt": now,
        "readBy.$.readInboundCount": conversation.totalInboundMessages,
      },
    },
  );

  if (!result.matchedCount) {
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $push: {
          readBy: {
            userId,
            lastReadAt: now,
            readInboundCount: conversation.totalInboundMessages,
          },
        },
      },
    );
  }
};





/** Assign a conversation to an agent */
export const assignConversation = async (
  conversationId,
  agentId,
  assignedBy,
) => {
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { userId: agentId, status: "progress" } },
    { new: true },
  ).populate("userId", "name email");

  if (!conversation) throw new Error("Conversation not found");

  return conversation;
};







/** Mark a conversation as completed */
export const resolveConversation = async (conversationId, resolvedBy) => {
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { status: "completed" } },
    { new: true },
  );

  if (!conversation) throw new Error("Conversation not found");

  return conversation;
};
