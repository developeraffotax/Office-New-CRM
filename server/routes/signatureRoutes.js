import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import { createSignature, getSignature, listSignatures, removeSignature, setDefaultSignature, updateSignature } from "../controllers/signatureController.js";
 

const router = express.Router();

 




// Standard CRUD
router.get('/', listSignatures);
router.get('/:id', getSignature);
router.post('/',requiredSignIn, createSignature);
router.put('/:id', updateSignature);
router.delete('/:id', removeSignature);

// Special Actions
router.post('/:id/set-default', setDefaultSignature);






export default router;
 