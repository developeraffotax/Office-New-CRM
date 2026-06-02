import * as messageService      from "../services/message.service.js";
import * as conversationService from "../services/conversation.service.js";

/** GET /conversations */
export const listConversations = async (req, res) => {
  try {
    const { status, userId, page, limit, search } = req.query;
    const result = await conversationService.getConversations({
      status, userId, page: +page, limit: +limit, search,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** GET /conversations/:id/messages */
export const listMessages = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await messageService.getMessages({
      conversationId: req.params.id,
      page: +page || 1,
      limit: +limit || 50,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};























/**
 * POST /conversations/:id/messages
 * Body: { to, phoneNumberId, type, body?, media?, template? }
 */
export const sendMessage = async (req, res) => {
  try {
    const { to, phoneNumberId, type, body, media, template, context  } = req.body;
    const userId = req.user?.user?._id; // assumes auth middleware sets req.user

    const message = await messageService.sendMessage({
      conversationId: req.params.id,
      phoneNumberId:  phoneNumberId ?? process.env.WHATSAPP_PHONE_NUMBER_ID,
      to,
      type,
      body,
      media,
      template,
      context,
      userId,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



































/** PATCH /conversations/:id/assign */
export const assignConversation = async (req, res) => {
  try {
    const { agentId } = req.body;
    const result = await conversationService.assignConversation(
      req.params.id, agentId, req.user?.user?._id
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** PATCH /conversations/:id/resolve */
export const resolveConversation = async (req, res) => {
  try {
    const result = await conversationService.resolveConversation(
      req.params.id, req.user?.user?._id
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** PATCH /conversations/:id/read */
export const markRead = async (req, res) => {
  try {
    await conversationService.markConversationRead(req.params.id, req.user?.user?._id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};