import { REPLY } from "../../../constants.js";
import { actionPrompts } from "./actionPrompt.js";
import { baseSystemPrompt } from "./systemPrompts.js";

function sanitizeInstructions(input = "") {
  return input
    .slice(0, 500)
    .replace(/[<>]/g, "")
    .replace(/(ignore previous|system prompt|override|developer)/gi, "");
}
 

 

export const createSystemPrompt = (

  actionType,
  projectContext = "",
  customInstructions = ""
) => {

  const safeCustomInstructions = sanitizeInstructions(customInstructions);

  const actionPrompt =
    actionType === REPLY
      ? actionPrompts.reply
      : actionPrompts.followUp;

  return `
${baseSystemPrompt}

${projectContext}

${actionPrompt}

ADDITIONAL USER INSTRUCTIONS
----------------------------
${safeCustomInstructions}

IMPORTANT
---------
Follow the project context and company instructions strictly.
Return only the requested format.
`;
};