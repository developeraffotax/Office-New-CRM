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

If the messageContent needs more than ~3 sentences, split it across multiple
<p> tags as described in the EMAIL FORMAT rules — do not return it as one
long <p> block.

OUTPUT FORMAT (STRICT JSON):

{
  "option": "Option ${optionNumber}",
  "content": "<p>Greeting</p><p><br/></p><p>First point...</p><p><br/></p><p>Second point, if the reply needs one...</p><p><br/></p><p>Signature</p>"
}
`;
};


export const userPromptForReply2 = (optionNumber) => {
  return `
INSTRUCTIONS:
- Generate reply email.
- Generate ONLY **Option ${optionNumber}**

LENGTH RULE:
${rules[optionNumber]}

If the messageContent needs more than ~3 sentences, split it across multiple
<p> tags as described in the EMAIL FORMAT rules — do not return it as one
long <p> block.

OUTPUT FORMAT (STRICT JSON):

{
  "option": "Option ${optionNumber}",
  "content": "<p>Greeting</p><p><br/></p><p>First point...</p><p><br/></p><p>Second point, if the reply needs one...</p><p><br/></p><p>Signature</p>"
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

If the messageContent needs more than ~3 sentences, split it across multiple
<p> tags as described in the EMAIL FORMAT rules — do not return it as one
long <p> block.

OUTPUT FORMAT (STRICT JSON):

{
  "option": "Option ${optionNumber}",
  "content": "<p>Greeting</p><p><br/></p><p>First point...</p><p><br/></p><p>Second point, if the follow-up needs one...</p><p><br/></p><p>Signature</p>"
}
`;
};
 




 