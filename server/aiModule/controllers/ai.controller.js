// import OpenAI from "openai";
// import { buildEmailContext } from "../utils/emailContextBuilder.js";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const generateEmailReplies = async (req, res) => {
//   try {
//     const { messages } = req.body;

//     const contextMessages = buildEmailContext(messages);

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

//     res.json({
//       success: true,
//       replies: parsed.replies,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate AI replies",
//     });
//   }
// };
