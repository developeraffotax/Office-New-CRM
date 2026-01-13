import { REPLY } from "../../../constants.js";
import { userPromptForFollowUp, userPromptForReply } from "./userPrompts.js";



export const createUserPrompt = (contextMessages, actionType) => {
  const userPrompt = `
Email conversation (ordered oldest → newest):
${contextMessages}

${actionType === REPLY ? userPromptForReply : userPromptForFollowUp}

`;

  return userPrompt;
};
