

import express from "express";
import { isAdmin, requiredSignIn } from "../../middlewares/authMiddleware.js";
import {    deleteThread, getMailbox, getMailboxUserCounts, getSentItems, getThreadMessageUsers, getUnreadCounts, markThreadAsRead, markThreadAsUnread, toggleStarredThread, updateThreadMetadata } from "../controllers/email.controller.js";
import { reply } from "../controllers/reply.controller.js";
import { forward } from "../controllers/forward.controller.js";
 
 
 

const router = express.Router();

 
router.get("/get-mailbox", requiredSignIn,   getMailbox);


router.get("/get-sent", requiredSignIn,   getSentItems);


 
router.put("/update-thread/:id", requiredSignIn,    updateThreadMetadata);






router.post("/reply", requiredSignIn,  reply);

router.post("/forward", requiredSignIn,  forward);


router.patch("/mark-as-read/:threadId", requiredSignIn,  markThreadAsRead);
router.patch("/mark-as-unread/:threadId", requiredSignIn,  markThreadAsUnread);
router.delete("/delete/:threadId", requiredSignIn,  isAdmin,   deleteThread);

router.patch("/star/:threadId", requiredSignIn,     toggleStarredThread);
 




router.get("/unread-counts", requiredSignIn,   getUnreadCounts);

router.get("/mailbox-user-counts", requiredSignIn, getMailboxUserCounts);





router.get("/thread-message-users", getThreadMessageUsers);


export default router;
