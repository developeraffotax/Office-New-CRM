import { REPLY } from "../../../constants.js";
import { systemPromptForFollowUp, systemPromptForReply } from "./systemPrompts.js";


//  export const createSystemPrompt = (actionType) => {
//    if (actionType === REPLY) {
//      return systemPromptForReply;
//    } else {
//      return systemPromptForFollowUp;
//    }
//  };


 export const createSystemPrompt = (actionType, customInstructions = "") => {
  // Sanitize the user input first
  const safeCustomInstructions = customInstructions
    .slice(0, 500) // hard limit
    .replace(/(system|json|html|markdown|ignore previous)/gi, ""); // basic injection filter

  const basePrompt =
    actionType === REPLY
      ? systemPromptForReply
      : systemPromptForFollowUp;

  if (!safeCustomInstructions) return basePrompt;

  // Append user instructions as HIGH-PRIORITY guidance
  return `
${basePrompt}

-MUST FOLLOW
${safeCustomInstructions}
  `;
};
