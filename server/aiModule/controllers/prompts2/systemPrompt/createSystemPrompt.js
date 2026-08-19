import { REPLY } from "../../../constants.js";
import { actionPrompts } from "./actionPrompt.js";
import { baseSystemPrompt } from "./systemPrompts.js";

export const createSystemPrompt = (
  actionType,
  projectContext = "",
  hasCustomInstructions = false
) => {
  const actionPrompt =
    actionType === REPLY ? actionPrompts.reply : actionPrompts.followUp;

  return `
${baseSystemPrompt}

${projectContext}

${actionPrompt}

PRIORITY ORDER
--------------
1. The OUTPUT FORMAT rules below — always.
2. ${hasCustomInstructions ? "The sender's custom instructions given later in this conversation — these override the tone/style/length defaults above." : "The tone/style/length defaults above."}
3. Project context and company defaults above.

IMPORTANT
---------
Return only the requested format.
`;
};