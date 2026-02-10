import express from "express";
 
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { addComment, deleteComment, getComments, getUnreadCounts } from "../controllers/comment.controller.js";
 

const router = express.Router();

router.post("/",  addComment);

router.post("/unread",  getUnreadCounts);



router.get("/:threadId",  getComments);

router.delete("/:commentId",  deleteComment);

export default router;