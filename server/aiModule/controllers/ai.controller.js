import { performance } from "perf_hooks";
import OpenAI from "openai";
import {
  buildEmailContext,
  fetchThreadMessages,
  getActionType,
} from "../utils/utils.js";
import { createSystemPrompt } from "./prompts2/systemPrompt/createSystemPrompt.js";
import { createUserPrompt } from "./prompts2/userPrompt/createUserPrompt.js";
import aiProject from "../models/aiProject.js";
import { buildProjectContext } from "../utils/buildProjectContext.js";
import colors from "colors";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



export const generateEmailReplies = async (req, res) => {
  try {
    const { threadId, customInstructions, projectId, companyName, optionNumber } = req.body;

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: "Missing threadId",
      });
    }

    const messages = await fetchThreadMessages(threadId, companyName);

    if (!messages.length) {
      return res.status(404).json({
        success: false,
        message: "No messages found",
      });
    }

    const contextMessages = buildEmailContext(messages);
    const actionType = getActionType(messages);

    let project;

    if (projectId) {
      project = await aiProject.findById(projectId).lean();
    } else {
      project = {
        companyName,
        aiConfig: {
          tone: "professional",
          instructions: "",
          signature: "",
          language: "English",
        },
      };
    }

    const projectContext = buildProjectContext(project);

    const systemPrompt = createSystemPrompt(
      actionType,
      projectContext,
      customInstructions
    );

    const userPrompt = createUserPrompt(
      contextMessages,
      actionType,
      optionNumber
    );

  // ---------------- PERFORMANCE HOOK START ----------------
    const startTime = performance.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const endTime = performance.now();
    console.log(
      `OpenAI API for Option ${optionNumber} completed in ${(endTime - startTime).toFixed(0)} ms`.bgMagenta.white
    );
    // ---------------- PERFORMANCE HOOK END ----------------


    const aiResponse = completion.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      console.error("AI raw response:", aiResponse);

      return res.status(500).json({
        success: false,
        message: "AI response parse failed",
      });
    }

    res.json({
      success: true,
      reply: parsed,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI reply",
    });
  }
};
































// const completion = await openai.chat.completions.create({
//   model: "gpt-5-mini",
//   messages: [
//     { role: "system", content: systemPrompt },
//     { role: "user", content: userPrompt },
//   ],
// });










// export const generateEmailReplies = async (req, res) => {
//   try {
//     const { threadId, customInstructions, projectId, companyName } = req.body;
//     if (!threadId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing threadId" });
//     }


//     console.log("THE REQ🧡🧡🧡🧡🧡", req.body)

//     const messages = await fetchThreadMessages(threadId, companyName);

//     if (!messages.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No messages found" });
//     }

//     /* ---------------- Prompt build timing ---------------- */

//     const contextMessages = buildEmailContext(messages);

//     const actionType = getActionType(messages);



//     let project;
//     if(projectId) {
//       project = await aiProject.findById(projectId).lean();

//     } else {
//       project = {
//         "companyName": companyName,
//         "aiConfig": {
//           "tone": "professional",
//           "instructions": "",
//           "signature": "",
//           "language": "English"
//         },
         
//       }
//     }





//     const projectContext = buildProjectContext(project);




//     const systemPrompt = createSystemPrompt(
 
//       actionType,
//       projectContext,
//       customInstructions,
//     );





//     const userPrompt = createUserPrompt(contextMessages, actionType);

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       temperature: 0.6,
//       max_tokens: 1200,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//     });

//     const aiResponse = completion.choices[0].message.content;

//     let parsed;
//     try {
//       parsed = JSON.parse(aiResponse);
//     } catch (err) {
//       console.error("AI raw response:", aiResponse);
//       return res.status(500).json({
//         success: false,
//         message: "AI response parse failed",
//       });
//     }

//     res.json({
//       success: true,
//       replies: parsed.messages,
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to generate AI replies" });
//   }
// };