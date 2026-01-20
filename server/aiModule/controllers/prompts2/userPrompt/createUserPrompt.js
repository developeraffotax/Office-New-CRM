import { REPLY } from "../../../constants.js";
import { buildUserCustomizationBlock, sanitizeUserPrompt } from "../../../utils/utils.js";
import { userPromptForFollowUp, userPromptForReply } from "./userPrompts.js";

export const createUserPrompt = (
  contextMessages,
  actionType,
 
) => `
EMAIL CONVERSATION (READ FOR CONTEXT ONLY):
---------------------------------------
${contextMessages}
---------------------------------------

${actionType === REPLY ? userPromptForReply : userPromptForFollowUp}

`;
