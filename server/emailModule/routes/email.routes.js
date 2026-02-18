

import express from "express";
import { isAdmin, requiredSignIn } from "../../middlewares/authMiddleware.js";
import {   deleteThread, getMailbox, getSentItems, getUnreadCounts, markThreadAsRead, updateThreadMetadata } from "../controllers/email.controller.js";
import { reply } from "../controllers/reply.controller.js";
import { forward } from "../controllers/forward.controller.js";
 
 

const router = express.Router();

 
router.get("/get-mailbox", requiredSignIn,   getMailbox);


router.get("/get-sent", requiredSignIn,   getSentItems);


 
router.put("/update-thread/:id", requiredSignIn,  isAdmin,   updateThreadMetadata);






router.post("/reply", requiredSignIn,  reply);

router.post("/forward", requiredSignIn,  forward);


router.patch("/mark-as-read/:threadId", requiredSignIn,  markThreadAsRead);
router.delete("/delete/:threadId", requiredSignIn,  isAdmin,   deleteThread);




router.get("/unread-counts", requiredSignIn,   getUnreadCounts);




export default router;
