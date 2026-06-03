import * as messageService      from "../services/message.service.js";
import * as conversationService from "../services/conversation.service.js";
import { serveMedia, uploadMediaBuffer } from "../services/media.service.js";

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



export const getMedia = async (req, res) => {
  try {
    await serveMedia(req, res);
  } catch (err) {
    logger.error("[Controller] Unhandled error in getMedia", {
      messageId: req.params.messageId,
      userId:    req.user?.user?._id,
      err:       err.message,
      stack:     err.stack,
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};















export const sendMessage = async (req, res) => {
  try {
    const { to, phoneNumberId, body, type, context } = req.body;
    const userId = req.user?.user?._id;
    const conversationId = req.params.id;

    const finalPhoneNumberId = phoneNumberId ?? process.env.WHATSAPP_AFFOTAX_PHONE_NUMBER_ID;
    const responses = [];

    // 1. Handle files if they exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        let msgType = "document";
        
        if (file.mimetype.startsWith("image/")) msgType = "image";
        else if (file.mimetype.startsWith("video/")) msgType = "video";
        else if (file.mimetype.startsWith("audio/")) msgType = "audio";

        // Stream the buffer straight up to Wasabi
        const { s3Key, presignedUrl } = await uploadMediaBuffer(file, to);

        // Transmit the payload with the fileUrl to your message service
        const mediaMsg = await messageService.sendMessage({
          conversationId,
          phoneNumberId: finalPhoneNumberId,
          to,
          type: msgType,
          media: {
            
            s3Key: s3Key,
            filename: file.originalname,
            caption: (body && msgType === "image") ? body : undefined, // Fixed logic
          },
          context,
          userId,

          presignedUrl
          
        });
        
        responses.push(mediaMsg);
      }
    } 
    // 2. Fallback: No files, just a plain text/template message
    else {
      const plainMsg = await messageService.sendMessage({
        conversationId,
        phoneNumberId: finalPhoneNumberId,
        to,
        type: type || "text",
        body,
        context,
        userId,
      });
      
      responses.push(plainMsg);
    }

    // Return an array of all successfully sent and saved messages
    res.status(201).json(responses);

  } catch (err) {
    console.error("Error in sendMessage controller:", err);
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