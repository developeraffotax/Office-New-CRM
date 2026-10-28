// services/aiEmail.service.js
import OpenAI from "openai";
import { buildEmailContext, getActionType } from "../utils/utils.js";
import { createSystemPrompt } from "../controllers/prompts2/systemPrompt/createSystemPrompt.js";
import { createUserPrompt } from "../controllers/prompts2/userPrompt/createUserPrompt.js";
import aiProject from "../models/aiProject.js";
import { buildProjectContext } from "../utils/buildProjectContext.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmailDraft({
  messages,
  companyName,
  projectId,
  customInstructions = "",
  optionNumber = 1,
}) {
  const contextMessages = buildEmailContext(messages);
  const actionType = getActionType(messages);

  const project = projectId
    ? await aiProject.findById(projectId).lean()
    : {
        companyName,
        aiConfig: { tone: "professional", instructions: "", signature: "", language: "English" },
      };

  const systemPrompt = createSystemPrompt(
    actionType,
    buildProjectContext(project),
    !!customInstructions?.trim(),
  );
  const userPrompt = createUserPrompt(contextMessages, actionType, optionNumber, customInstructions);

  const completion = await openai.chat.completions.create({
    model: "gpt-5.6-luna",
    max_completion_tokens: 800,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return JSON.parse(completion.choices[0].message.content); // throws on bad JSON
}