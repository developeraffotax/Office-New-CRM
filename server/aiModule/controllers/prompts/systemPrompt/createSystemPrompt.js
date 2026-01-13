import { REPLY } from "../../../constants.js";
import { systemPromptForFollowUp, systemPromptForReply } from "./systemPrompts.js";


 export const createSystemPrompt = (actionType) => {
   if (actionType === REPLY) {
     return systemPromptForReply;
   } else {
     return systemPromptForFollowUp;
   }
 };
