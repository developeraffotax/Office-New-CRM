import { FOLLOW_UP, REPLY } from "../../../constants.js";

export const userPromptForReply = `
Instructions:

- Generate EXACTLY 4 reply options.
- All replies must be professional, clear, and concise.
- Each option must respond appropriately to the LAST message.

LENGTH REQUIREMENTS:

- Option 1: Very short (brief acknowledgement or direct answer)
- Option 2: Moderately detailed (standard professional reply)
- Option 3: Detailed & explanatory (adds helpful clarification)
- Option 4: Very detailed & comprehensive (full clarity, still professional)

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "actionType": ${REPLY},
  "messages": [
    {
      "option": "Option 1",
      "content": "<p>...</p>"
    },
    {
      "option": "Option 2",
      "content": "<p>...</p>"
    },
    {
      "option": "Option 3",
      "content": "<p>...</p>"
    },
    {
      "option": "Option 4",
      "content": "<p>...</p>"
    }
  ]
}
`;




export const userPromptForFollowUp = `
Instructions:

- Generate EXACTLY 4 follow-up message options.
- All follow-ups must be professional, polite, and engaging.
- Each option should encourage a response or next step naturally.

LENGTH REQUIREMENTS:

- Option 1: Very short (gentle nudge)
- Option 2: Moderately detailed (friendly professional reminder)
- Option 3: Detailed & explanatory (adds context or value)
- Option 4: Very detailed & comprehensive (clear next steps, reassurance)

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "actionType": ${FOLLOW_UP},
  "messages": [
    {
      "option": "Option 1",
      "content": "<p>...</p>"
    },
    {
      "option": "Option 2",
      "content": "<p>...</p>"
    },
    {
      "option": "Option 3",
      "content": "<p>...</p>"
    },
    {
      "option": "Option 4",
      "content": "<p>...</p>"
    }
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












 