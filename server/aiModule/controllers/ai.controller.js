import { performance } from "perf_hooks";
import OpenAI from "openai";
import { buildEmailContext, fetchThreadMessages,   getActionType } from "../utils/utils.js";
import { createSystemPrompt } from "./prompts/systemPrompt/createSystemPrompt.js";
import { createUserPrompt } from "./prompts/userPrompt/createUserPrompt.js";
 
 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateEmailReplies = async (req, res) => {
  const t0 = performance.now(); // total request start

  try {
    const { threadId, customInstructions } = req.body;
    if (!threadId) {
      return res.status(400).json({ success: false, message: "Missing threadId" });
    }

    /* ---------------- Gmail API timing ---------------- */
    const tGmailStart = performance.now();
    const messages = await fetchThreadMessages(threadId);
    const tGmailEnd = performance.now();


    // return console.log("MESSAGES ARE 💚", messages)

    if (!messages.length) {
      return res.status(404).json({ success: false, message: "No messages found" });
    }

    /* ---------------- Prompt build timing ---------------- */
    const tPromptStart = performance.now();
    const contextMessages = buildEmailContext(messages);

    const actionType = getActionType(messages)

    const systemPrompt = createSystemPrompt(actionType, customInstructions);

 
    const userPrompt = createUserPrompt(contextMessages, actionType);

    console.log("THE systemPrompt IS 💛", systemPrompt)
    const tPromptEnd = performance.now();

    /* ---------------- OpenAI timing ---------------- */
    const tOpenAIStart = performance.now();

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });


    // const completion = await openai.chat.completions.create({
    //   model: "gpt-5-mini",
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: userPrompt },
    //   ],
    // });
    const tOpenAIEnd = performance.now();

    /* ---------------- Parse timing ---------------- */
    const tParseStart = performance.now();
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
    const tParseEnd = performance.now();

    const tTotalEnd = performance.now();

    /* ---------------- Timing summary ---------------- */
    const timings = {
      gmailFetchMs: +(tGmailEnd - tGmailStart).toFixed(2),
      promptBuildMs: +(tPromptEnd - tPromptStart).toFixed(2),
      openAIMs: +(tOpenAIEnd - tOpenAIStart).toFixed(2),
      parseMs: +(tParseEnd - tParseStart).toFixed(2),
      totalMs: +(tTotalEnd - t0).toFixed(2),
      messageCount: messages.length,
      promptChars: userPrompt.length,
    };

    console.table(timings);
    console.log(parsed)

    res.json({
      success: true,
      replies: parsed.messages,
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to generate AI replies" });
  }
};
