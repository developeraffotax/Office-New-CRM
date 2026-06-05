import { Router } from "express";
import { listConversations, listMessages, markRead, sendMessage,  getMedia, updateConversationMetadata, deleteConversation,  } from "../controllers/whatsapp.controller.js";
import multer from "multer";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
 
 
 
 
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

 
router.post ("/conversations/:id/messages",  upload.array("files"), sendMessage);

// Conversations (add authMiddleware as needed)
router.get  ("/conversations",               listConversations);
router.get  ("/conversations/:id/messages", listMessages);


router.put("/update-conversation/:id",   updateConversationMetadata);



// router.patch("/conversations/:id/assign",   assignConversation);
// router.patch("/conversations/:id/resolve",  resolveConversation);
router.patch("/conversations/:id/read",     markRead);





router.delete("/conversations/delete/:id",     deleteConversation);













// router.get  ("/media/:messageId",  requiredSignIn,   getMedia);





export default router;