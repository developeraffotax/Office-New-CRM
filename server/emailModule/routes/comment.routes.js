import express from "express";
 
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { addComment, deleteComment, getComments } from "../controllers/comment.controller.js";
 

const router = express.Router();

router.post("/",  addComment);

router.get("/:threadId",  getComments);

router.delete("/:commentId",  deleteComment);

export default router;