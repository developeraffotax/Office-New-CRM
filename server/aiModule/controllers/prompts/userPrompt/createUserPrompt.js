import { REPLY } from "../../../constants.js";
import { buildUserCustomizationBlock, sanitizeUserPrompt } from "../../../utils/utils.js";
import { userPromptForFollowUp, userPromptForReply } from "./userPrompts.js";

export const createUserPrompt = (
  contextMessages,
  actionType,
  userCustomInstructions = ""
) => `
EMAIL CONVERSATION (READ FOR CONTEXT ONLY):
---------------------------------------
${contextMessages}
---------------------------------------

TASK:
You must generate ${actionType === REPLY ? "EMAIL REPLIES" : "FOLLOW-UP EMAILS"}.

CRITICAL BEHAVIOUR RULES:
- Respond ONLY to the LAST email in the conversation.
- Do NOT address earlier messages unless repeated in the last email.
- Maintain a professional UK accounting tone at all times.

${actionType === REPLY ? userPromptForReply : userPromptForFollowUp}


`;
