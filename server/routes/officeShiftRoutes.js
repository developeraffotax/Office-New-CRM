import express from "express";

import { requiredSignIn } from "../middlewares/authMiddleware.js"; 
import { getShift, updateShift } from "../controllers/officeShiftContoller.js";

const router = express.Router();


router.get("/", requiredSignIn, getShift);

router.put("/", requiredSignIn, updateShift);


export default router;
