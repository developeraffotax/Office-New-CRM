

import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { getInbox, getSentItems, updateThreadMetadata } from "../controllers/email.controller.js";
 
 

const router = express.Router();

 
router.get("/get-inbox", requiredSignIn,   getInbox);


router.get("/get-sent", requiredSignIn,   getSentItems);


 
router.put("/update-thread/:id", requiredSignIn,  updateThreadMetadata);

export default router;
