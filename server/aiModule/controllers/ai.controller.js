import OpenAI from "openai";
import { buildEmailContext } from "../utils/emailContextBuilder.js";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });



const mock = {
  "replies": [
    {
      "tone": "Professional & concise",
      "content": "Hi Dan,\n\nThank you for letting me know. That’s absolutely fine — once Xero is sorted, just drop me a message and we’ll pick things up from there.\n\nKind regards,\nRashid"
    },
    {
      "tone": "Friendly & reassuring",
      "content": "Hi Dan,\n\nThanks for the update — no problem at all. Take your time getting Xero sorted and feel free to reach out when you’re ready. I’ll be happy to help and make the rest straightforward.\n\nBest regards,\nRashid"
    },
    {
      "tone": "Detailed & explanatory",
      "content": "Hi Dan,\n\nThank you for the update. That’s no problem at all.\n\nOnce you’ve finished sorting Xero, just let me know and I’ll review everything with you. If you need any guidance while setting things up or have questions in the meantime, feel free to reach out — I’m happy to assist.\n\nWe can then ensure the accounts are completed smoothly ahead of the deadline.\n\nKind regards,\nRashid"
    },
    {
      "tone": "Very short confirmation",
      "content": "Hi Dan,\n\nThanks for the update — no problem at all. Speak soon.\n\nRashid"
    }
  ]
}
export const generateEmailReplies = async (req, res) => {
  try {
     const { messages } = req.body;

     console.log(" THE EMAIL MESSAGES ARE💜💜💜", messages)

//       const contextMessages = buildEmailContext(messages);

//     const systemPrompt = `
// You are a professional accountant at Affotax.
// Generate multiple alternative email replies.
// Rules:
// - Do NOT repeat quoted email history
// - No subject line
// - End with "Kind regards, Affotax"
// - Each reply must be different in tone
// `;

//     const userPrompt = `
// Email conversation:
// ${contextMessages.map((m, i) => `
// Message ${i + 1}:
// From: ${m.from}
// ${m.body}
// `).join("\n")}

// Generate exactly 4 different reply options.
// Return the result strictly in JSON like this:

// {
//   "replies": [
//     { "tone": "Professional & concise", "content": "..." },
//     { "tone": "Friendly & reassuring", "content": "..." },
//     { "tone": "Detailed & explanatory", "content": "..." },
//     { "tone": "Very short confirmation", "content": "..." }
//   ]
// }
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-5-mini",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//       temperature: 0.6,
//     });

//     const aiResponse = completion.choices[0].message.content;

//     // Safe parse
//     const parsed = JSON.parse(aiResponse);

    res.json({
      success: true,
      replies: mock.replies,
    //   replies: parsed.replies,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI replies",
    });
  }
};
