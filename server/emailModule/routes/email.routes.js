

import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import {   getMailbox, getSentItems, updateThreadMetadata } from "../controllers/email.controller.js";
 
 

const router = express.Router();

 
router.get("/get-mailbox", requiredSignIn,   getMailbox);


router.get("/get-sent", requiredSignIn,   getSentItems);


 
router.put("/update-thread/:id", requiredSignIn,  updateThreadMetadata);

export default router;
