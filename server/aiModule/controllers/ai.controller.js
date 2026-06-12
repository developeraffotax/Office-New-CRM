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
      `OpenAI API for Option ${optionNumber || 1} completed in ${(endTime - startTime).toFixed(0)} ms`.bgMagenta.white
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
      message: err?.message || "Failed to generate AI reply",
    });
  }
};































 






 








































export const generateEmailSummary = async (req, res) => {
  try {
    const { threadId, projectId, companyName } = req.query;

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: "Missing threadId",
      });
    }

    const messages = await fetchThreadMessages(threadId, companyName);

    if (!messages?.length) {
      return res.status(404).json({
        success: false,
        message: "No messages found",
      });
    }

    const contextMessages = buildEmailContext(messages);

 

    const systemPrompt = `
You are an expert email analyst.

Your task is to summarize an email thread.

Return ONLY valid JSON in the following format:

{
  "summary": "2-4 paragraph summary",
  "keyPoints": [
    "point 1",
    "point 2",
    "point 3"
  ],
  "actionItems": [
    "action item 1",
    "action item 2"
  ],
  "participants": [
    "person/company name"
  ],
  "status": "Open | Waiting for Client | Waiting for Us | Resolved"
}

Rules:
- Be concise but complete.
- Identify decisions made.
- Identify outstanding questions.
- Extract action items.
- Determine current thread status.
- Return JSON only.
`;

    const userPrompt = `
Company: ${companyName || "Unknown"}

Email Thread:

${contextMessages}
`;

    // ---------------- PERFORMANCE HOOK START ----------------
    const startTime = performance.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const endTime = performance.now();

    console.log(
      `OpenAI Email Summary completed in ${(endTime - startTime).toFixed(
        0
      )} ms`
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
        message: "Failed to parse AI summary",
      });
    }

    return res.status(200).json({
      success: true,
      summary: parsed,
    });
  } catch (err) {
    console.error("generateEmailSummary error:", err);

    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to generate email summary",
    });
  }
};































 






 