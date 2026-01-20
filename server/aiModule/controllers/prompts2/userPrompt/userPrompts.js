import { FOLLOW_UP, REPLY } from "../../../constants.js";

export const userPromptForReply = `
INSTRUCTIONS:
- Generate EXACTLY 4 reply options.
 
OUTPUT FORMAT (STRICT JSON ONLY):

{
  "actionType": "REPLY",
  "messages": [
    { "option": "Option 1", "content": "<p>...</p>" },
    { "option": "Option 2", "content": "<p>...</p>" },
    { "option": "Option 3", "content": "<p>...</p>" },
    { "option": "Option 4", "content": "<p>...</p>" }
  ]
}
`;


export const userPromptForFollowUp = `
INSTRUCTIONS:
- Generate EXACTLY 4 follow-up email options.

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "actionType": "FOLLOW_UP",
  "messages": [
    { "option": "Option 1", "content": "<p>...</p>" },
    { "option": "Option 2", "content": "<p>...</p>" },
    { "option": "Option 3", "content": "<p>...</p>" },
    { "option": "Option 4", "content": "<p>...</p>" }
  ]
}
`;







