import * as messageService      from "../services/message.service.js";
import * as conversationService from "../services/conversation.service.js";
import {   uploadMediaBuffer } from "../services/media.service.js";
import WhatsappConversation from "../models/WhatsappConversation.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { emitToUser } from "../../utils/socketEmitter.js";
import { isSelfAssignment } from "../utils/utils.js";
import { createNotification } from "../utils/createNotification.js";
import { io } from "../../index.js";
 


 
export const listConversations = async (req, res, next) => {
  try {
    const { status, userId, page, limit, search } = req.query;
    const result = await conversationService.getConversations(req);

     
    res.json(result);
  } catch (err) {
     next(err)
  }
};

 
export const listMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await messageService.getMessages({
      conversationId: req.params.id,
      page: +page || 1,
      limit: +limit || 50,
    });
 
    res.json(result);
  } catch (err) {
     
    next(err)
  }
};



// export const getMedia = async (req, res, next) => {
//   try {
//     await serveMedia(req, res);
//   } catch (err) {
     
//   next(err)
//   }
// };















export const sendMessage = async (req, res, next) => {
  try {
    const { to, phoneNumberId, body, type, context } = req.body;

    console.log(req.body)

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
          body,
          type: msgType,
          media: {
            
            s3Key: s3Key,
            filename: file.originalname,
            caption: (body && msgType === "image") ? body : undefined, // Fixed logic
          },
          context,
          // userId,

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
        // userId,
      });
      
      responses.push(plainMsg);
    }

    // Return an array of all successfully sent and saved messages
    res.status(201).json(responses);

  } catch (err) {
      next(err)
  }
};






















export const updateConversationMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    /**
     * 1️⃣ Whitelist validation
     */
    const allowedUpdates = ["category", "userId", "status", "isStarred",];
    const updateKeys = Object.keys(updates);

    const isValidUpdate = updateKeys.every((key) =>
      allowedUpdates.includes(key),
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields in update!",
      });
    }

    /**
     * 2️⃣ Fetch old thread
     */
    const oldConversation = await WhatsappConversation.findById(id);
    if (!oldConversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found!",
      });
    }

    if (updates?.userId) {
      updates.userId = new mongoose.Types.ObjectId(updates.userId);
    }


    /**
     * 3️⃣ Update thread
     */
    const updatedConversation = await WhatsappConversation.findOneAndUpdate({_id: id}, {$set: {...updates}}, {
      new: true,
      runValidators: true,
      //  updatedBy: req?.user?.user?._id
    }).lean();

    // console.log("UPDATED THREAD✔️", updatedConversation)

    /**
     * 4️⃣ Assignment diff
     */
    const oldUserId = oldConversation.userId?.toString() || null;
    const newUserId = updatedConversation.userId?.toString() || null;

    const selfAssign = isSelfAssignment(req?.user?.user, newUserId);

    /**
     * 5️⃣ Notifications (skip self-assign)
     */
    if (updateKeys.includes("userId") && !selfAssign) {
      await createNotification(req, updatedConversation);
    }

    /**
     * 6️⃣ Socket emits (skip self-assign)
     */

     const eventName = `whatsappmetadata:updated-${updatedConversation.companyName}`;

    // Assigned → Unassigned OR Reassigned
    if (oldUserId && !isSelfAssignment(req?.user?.user, oldUserId)) {
      io.to(`user:${oldUserId}`).emit(`whatsapp:conversation-update-${updatedConversation.companyName}`, {
            action: "updated",
            thread: updatedConversation
          });
    }

    // Unassigned → Assigned OR Reassigned
    if (
      newUserId &&
      newUserId !== oldUserId &&
      !isSelfAssignment(req?.user?.user, newUserId)
    ) {
      io.to(`user:${newUserId}`).emit(`whatsapp:conversation-update-${updatedConversation.companyName}`, {
            action: "updated",
            thread: updatedConversation
          });
    }

    /**
     * 7️⃣ Response
     */
    res.status(200).json({
      success: true,
      message: "Conversation updated successfully!",
      thread: updatedConversation,
    });
  } catch (error) {
    
    next(error)

 
  }
};



 

/** PATCH /conversations/:id/read */
export const markRead = async (req, res, next) => {
  try {
    await conversationService.markConversationRead(req.params.id, req.user?.user?._id);
    res.sendStatus(204);
  } catch (err) {
    next(err)
     
  }
};







 
export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params; // MongoDB _id
    const { companyName } = req.body;

 
    const conversation = await WhatsappConversation.findOneAndDelete({ _id: id, companyName });

    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

 
 

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
     next(err)
  }
};






















export const getWhatsappUserCounts = async (req, res, next) => {
  try {
    const {allCount, unassignedCount, userCounts} = await conversationService.getWhatsappUserCounts(req, res)
    res.json({ success: true, userCounts, unassignedCount, allCount: allCount, });
  } catch (error) {
      next(error)
  }
};