import { Router } from "express";
import { listConversations, listMessages, markRead, sendMessage, assignConversation, resolveConversation,  } from "../controllers/whatsapp.controller.js";
 
 
 
 

const router = Router();

 
router.post ("/conversations/:id/messages", sendMessage);

// Conversations (add authMiddleware as needed)
router.get  ("/conversations",              listConversations);
router.get  ("/conversations/:id/messages", listMessages);
router.patch("/conversations/:id/assign",   assignConversation);
router.patch("/conversations/:id/resolve",  resolveConversation);
router.patch("/conversations/:id/read",     markRead);




export default router;