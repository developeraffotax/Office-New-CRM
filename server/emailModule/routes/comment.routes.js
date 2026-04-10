import express from "express";
 
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { addComment, deleteComment, getComments, getUnreadCounts } from "../controllers/comment.controller.js";
 

const router = express.Router();

router.post("/", requiredSignIn, addComment);

router.post("/unread",requiredSignIn,  getUnreadCounts);



router.get("/:threadId",requiredSignIn,  getComments);

router.delete("/:commentId",requiredSignIn,  deleteComment);

export default router;