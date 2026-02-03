

import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import {   deleteThread, getMailbox, getSentItems, markThreadAsRead, updateThreadMetadata } from "../controllers/email.controller.js";
import { reply } from "../controllers/reply.controller.js";
import { forward } from "../controllers/forward.controller.js";
 
 

const router = express.Router();

 
router.get("/get-mailbox", requiredSignIn,   getMailbox);


router.get("/get-sent", requiredSignIn,   getSentItems);


 
router.put("/update-thread/:id", requiredSignIn,  updateThreadMetadata);






router.post("/reply", requiredSignIn,  reply);

router.post("/forward", requiredSignIn,  forward);


router.patch("/mark-as-read/:threadId", requiredSignIn,  markThreadAsRead);
router.delete("/delete/:threadId", requiredSignIn,  deleteThread);









export default router;
