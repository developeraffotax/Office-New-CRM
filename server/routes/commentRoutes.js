import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  commentReply,
  createComment,
  likeComment,
  unLikeComment,
} from "../controllers/commentsController.js";

const router = express.Router();

// Add Comment
router.post("/post/comment", requiredSignIn, createComment);

// Reply Comment
router.put("/reply/comment", requiredSignIn, commentReply);

// Like Comment
router.put("/like/comment", requiredSignIn, likeComment);

// Unlike COmment
router.put("/unlike/comment", requiredSignIn, unLikeComment);

export default router;
