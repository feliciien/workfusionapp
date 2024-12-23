import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for Vercel Hobby plan

const MAX_RETRIES = 2;
const TIMEOUT_DURATION = 60000; // 60 seconds

async function makeOpenAIRequest(openai: OpenAI, messages: any[], controller: AbortController, retryCount = 0) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }, { signal: controller.signal });

    let content = '';
    for await (const chunk of response) {
      const chunkContent = chunk.choices[0]?.delta?.content || '';
      content += chunkContent;
    }

    return content;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES && (error.name === 'AbortError' || error.code === 'ECONNABORTED')) {
      console.log(`[CONTENT_RETRY] Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
      return makeOpenAIRequest(openai, messages, controller, retryCount + 1);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | undefined;
  let requestData: { prompt?: string; type?: string; tone?: string } = {};

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured"
      }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, type = "blog", tone = "professional" } = body;
    requestData = { prompt, type, tone };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({
        success: false,
        error: "Prompt is required and must be a string"
      }, { status: 400 });
    }

    if (prompt.length > 1000) {
      return NextResponse.json({
        success: false,
        error: "Prompt is too long. Maximum length is 1000 characters"
      }, { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return NextResponse.json({
        success: false,
        error: "Free trial has expired. Please upgrade to pro."
      }, { status: 403 });
    }

    timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    const systemPrompt = `You are an expert content writer specializing in creating engaging, well-researched, and SEO-optimized content.

Content Type: ${type}
Tone: ${tone}

Follow these guidelines:
1. Start with an attention-grabbing introduction
2. Use clear headings and subheadings for structure
3. Include relevant statistics and examples when applicable
4. Maintain consistent tone and voice throughout
5. End with a strong conclusion and call-to-action
6. Use markdown formatting for better readability

Writing Style:
- Keep paragraphs concise (3-4 sentences max)
- Use active voice when possible
- Include relevant keywords naturally
- Add bullet points or numbered lists for better readability
- Bold important concepts or key terms
- Use analogies or examples to explain complex ideas

Format your response in proper markdown for optimal readability.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    const content = await makeOpenAIRequest(openai, messages, controller);

    if (timeoutId) clearTimeout(timeoutId);

    if (!content) {
      throw new Error("No content generated");
    }

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      success: true,
      data: { content }
    });

  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.message?.includes('abort')) {
      console.error("[CONTENT_TIMEOUT]", {
        error: error.message,
        prompt: requestData.prompt,
        type: requestData.type,
        tone: requestData.tone,
        retries: MAX_RETRIES
      });
      return NextResponse.json({
        success: false,
        error: "Request timed out. Please try again with a shorter prompt or simpler request."
      }, { status: 504 });
    }

    console.error("[CONTENT_ERROR]", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      requestData
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error",
      errorType: error.name
    }, { status: 500 });
  }
}
