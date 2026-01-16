import { FOLLOW_UP, REPLY } from "../../../constants.js";

export const userPromptForReply = `
INSTRUCTIONS:

- Generate EXACTLY 4 reply options.
- Each option MUST respond directly and appropriately to the LAST email only.
- Replies must be professional, clear, and accurate.

LENGTH REQUIREMENTS:

- Option 1: Very short (brief acknowledgement or direct answer)
- Option 2: Moderately detailed (standard professional reply)
- Option 3: Detailed & explanatory (helpful clarification or reassurance)
- Option 4: Very detailed & comprehensive (full clarity, next steps if appropriate)

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
- Follow-ups must be polite, professional, and non-pushy.
- The goal is to re-engage and encourage a response or next step.

LENGTH REQUIREMENTS:

- Option 1: Very short (gentle nudge)
- Option 2: Moderately detailed (friendly professional reminder)
- Option 3: Detailed & explanatory (adds context or value)
- Option 4: Very detailed & comprehensive (clear next steps and reassurance)

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



































// export const userPromptForReply = `
// Instructions:
// - Analyze the full conversation for context.
// - Generate exactly 4 message options accordingly.
// - All replies must be professional & concise.
// - Option 1 must be very short.
// - Option 2 must be moderately detailed.
// - Option 3 must be detailed & explanatory.
// - Option 4 must be very detailed & comprehensive.

// Return JSON strictly in this format:

// {
//   "actionType": ${REPLY},
//   "messages": [
//     {
//       "option": "Option 1",
//       "content": "<p>...</p>"
//     },
//     {
//       "option": "Option 2",
//       "content": "<p>...</p>"
//     },
//     {
//       "option": "Option 3",
//       "content": "<p>...</p>"
//     },
//     {
//       "option": "Option 4",
//       "content": "<p>...</p>"
//     }
//   ]
// }`




// export const userPromptForFollowUp = `
// Instructions:
// - Analyze the full conversation for context.
// - Generate exactly 4 message options accordingly.
// - All follow-up messages must be professional & concise.
// - Option 1 must be very short.
// - Option 2 must be moderately detailed.
// - Option 3 must be detailed & explanatory.
// - Option 4 must be very detailed & comprehensive.

// Return JSON strictly in this format:

// {
//   "actionType": ${FOLLOW_UP},
//   "messages": [
//     {
//       "option": "Option 1",
//       "content": "<p>...</p>"
//     },
//     {
//       "option": "Option 2",
//       "content": "<p>...</p>"
//     },
//     {
//       "option": "Option 3",
//       "content": "<p>...</p>"
//     },
//     {
//       "option": "Option 4",
//       "content": "<p>...</p>"
//     }
//   ]
// }`












 