import { FOLLOW_UP, REPLY } from "../../../constants.js";


  const rules = {
    1: "Very short messageContent (1-2 sentences)",
    2: "Short messageContent (3-4 sentences)",
    3: "Medium messageContent (5-7 sentences)",
    4: "Detailed messageContent (8-12 sentences)",
  };


export const userPromptForReply = (optionNumber) => {


  return `
INSTRUCTIONS:
-Generate reply email.
-Generate ONLY **Option ${optionNumber}**

LENGTH RULE:
${rules[optionNumber]}

OUTPUT FORMAT (STRICT JSON):

{
  "option": "Option ${optionNumber}",
  "content": "<p>...</p>"
}
`;
};



export const userPromptForFollowUp = (optionNumber) => {
 

  return `
INSTRUCTIONS:
- Generate follow-up email.
- Generate ONLY **Option ${optionNumber}**


LENGTH RULE:
${rules[optionNumber]}

OUTPUT FORMAT (STRICT JSON):

{
  "option": "Option ${optionNumber}",
  "content": "<p>...</p>"
}
`;
};
 








// export const userPromptForReply = `
// INSTRUCTIONS:
// - Generate EXACTLY 4 reply options.
 

// LENGTH RULE:
// The sentence limits apply ONLY to {{messageContent}}.
 

// Option 1: Very short messageContent (1-2 sentences)
// Option 2: Short messageContent (3-4 sentences)
// Option 3: Medium messageContent (5-7 sentences)
// Option 4: Detailed messageContent (8-12 sentences)
 
// OUTPUT FORMAT (STRICT JSON ONLY):

// {
//   "actionType": "REPLY",
//   "messages": [
//     { "option": "Option 1", "content": "<p>...</p>" },
//     { "option": "Option 2", "content": "<p>...</p>" },
//     { "option": "Option 3", "content": "<p>...</p>" },
//     { "option": "Option 4", "content": "<p>...</p>" }
//   ]
// }
// `;



// export const userPromptForFollowUp = `
// INSTRUCTIONS:
// - Generate EXACTLY 4 follow-up email options.
 

// LENGTH RULE:
// The sentence limits apply ONLY to {{messageContent}}.
 

// Option 1: Very short messageContent (1-2 sentences)
// Option 2: Short messageContent (3-4 sentences)
// Option 3: Medium messageContent (5-7 sentences)
// Option 4: Detailed messageContent (8-12 sentences)


// OUTPUT FORMAT (STRICT JSON ONLY):

// {
//   "actionType": "FOLLOW_UP",
//   "messages": [
//     { "option": "Option 1", "content": "<p>...</p>" },
//     { "option": "Option 2", "content": "<p>...</p>" },
//     { "option": "Option 3", "content": "<p>...</p>" },
//     { "option": "Option 4", "content": "<p>...</p>" }
//   ]
// }
// `;



