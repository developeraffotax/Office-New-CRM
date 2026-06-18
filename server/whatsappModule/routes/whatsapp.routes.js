import { Router } from "express";
import { listConversations, listMessages, markRead, sendMessage,  updateConversationMetadata, deleteConversation, getWhatsappUserCounts, addReactionToMessage,  } from "../controllers/whatsapp.controller.js";
import multer from "multer";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
 
 
 
 
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

 
router.post ("/conversations/:id/messages",  upload.array("files"), sendMessage);


router.post( "/conversations/:conversationId/messages/:messageId/reactions",  addReactionToMessage );

// Conversations (add authMiddleware as needed)
router.get  ("/conversations",               listConversations);
router.get  ("/conversations/:id/messages", listMessages);


router.put("/update-conversation/:id",   updateConversationMetadata);



// router.patch("/conversations/:id/assign",   assignConversation);
// router.patch("/conversations/:id/resolve",  resolveConversation);
router.patch("/conversations/:id/read",     markRead);





router.delete("/conversations/delete/:id",     deleteConversation);








router.get("/conversations/user-counts",   getWhatsappUserCounts);

 




export default router;