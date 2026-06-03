import { Router } from "express";
import { listConversations, listMessages, markRead, sendMessage, assignConversation, resolveConversation, getMedia,  } from "../controllers/whatsapp.controller.js";
import multer from "multer";
 
 
 
 
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

 
router.post ("/conversations/:id/messages",  upload.array("files"), sendMessage);

// Conversations (add authMiddleware as needed)
router.get  ("/conversations",              listConversations);
router.get  ("/conversations/:id/messages", listMessages);
router.patch("/conversations/:id/assign",   assignConversation);
router.patch("/conversations/:id/resolve",  resolveConversation);
router.patch("/conversations/:id/read",     markRead);


router.get  ("/media/:messageId", getMedia);

export default router;