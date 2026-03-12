import { FOLLOW_UP, REPLY } from "../../../constants.js";

export const userPromptForReply = `
INSTRUCTIONS:
- Generate EXACTLY 4 reply options.
 

LENGTH RULE:
The sentence limits apply ONLY to {{messageContent}}.
 

Option 1: Very short messageContent (1-2 sentences)
Option 2: Short messageContent (3-4 sentences)
Option 3: Medium messageContent (5-7 sentences)
Option 4: Detailed messageContent (8-12 sentences)
 
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
 

LENGTH RULE:
The sentence limits apply ONLY to {{messageContent}}.
 

Option 1: Very short messageContent (1-2 sentences)
Option 2: Short messageContent (3-4 sentences)
Option 3: Medium messageContent (5-7 sentences)
Option 4: Detailed messageContent (8-12 sentences)


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










export const userPromptForReply2 = `
INSTRUCTIONS:
- Generate EXACTLY 4 reply options.
- Each option MUST follow the email structure defined in the system prompt.

LENGTH RULE:
The sentence limits apply ONLY to {{messageContent}}.
Do NOT remove {{Greetings}} or {{Signature}}.

Option 1: Very short messageContent (1-2 sentences)
Option 2: Short messageContent (3-4 sentences)
Option 3: Medium messageContent (5-7 sentences)
Option 4: Detailed messageContent (8-12 sentences)

IMPORTANT:
- Always keep the full email format:
  Greeting → messageContent → Signature
- Only vary the length of {{messageContent}}.
- Follow the HTML structure from the system prompt exactly.

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








