import { REPLY } from "../../../constants.js";
import { buildUserCustomizationBlock } from "../../../utils/utils.js";
import { userPromptForFollowUp, userPromptForReply } from "./userPrompts.js";

export const createUserPrompt = (
  contextMessages,
  actionType,
  optionNumber = "1",
  customInstructions = ""
) => `
EMAIL CONVERSATION (READ FOR CONTEXT ONLY):
---------------------------------------
${contextMessages}
---------------------------------------
${buildUserCustomizationBlock(customInstructions)}
${actionType === REPLY
  ? userPromptForReply(optionNumber)
  : userPromptForFollowUp(optionNumber)
}
`;