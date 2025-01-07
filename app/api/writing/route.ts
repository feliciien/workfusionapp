import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureLimit, increaseFeatureUsage } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to get word count target based on length option
const getWordCountTarget = (length: string): number => {
  switch (length) {
    case "short":
      return 100;
    case "medium":
      return 300;
    case "long":
      return 500;
    case "article":
      return 1000;
    default:
      return 300;
  }
};

// Helper function to create system message based on style and length
const createSystemMessage = (style: string, wordCount: number): string => {
  const styleGuide = {
    professional: "Write in a clear, professional tone suitable for business communication.",
    casual: "Write in a friendly, conversational tone that's easy to read.",
    academic: "Write in a formal, academic tone with proper citations and technical language.",
    creative: "Write in a creative, engaging style that captures the reader's imagination.",
    technical: "Write in a precise, technical style focusing on accuracy and detail."
  };

  return `You are a professional writer. Write content that is:
- ${styleGuide[style as keyof typeof styleGuide]}
- Approximately ${wordCount} words in length
- Well-structured with clear paragraphs
- Engaging and informative
- Free of grammatical errors
- Original and unique

Format the text with proper paragraphs and spacing.`;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, style = "professional", length = "medium" } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Validate prompt length
    if (prompt.length < 3) {
      return new NextResponse("Prompt too short. Please provide more details.", { status: 400 });
    }

    if (prompt.length > 1000) {
      return new NextResponse("Prompt too long. Maximum length is 1000 characters.", { status: 400 });
    }

    const isPro = await checkSubscription(userId);
    const canGenerate = await checkFeatureLimit(userId, FEATURE_TYPES.CONTENT_WRITER);

    if (!isPro && !canGenerate) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return new NextResponse("Writing service not configured", { status: 500 });
    }

    const wordCount = getWordCountTarget(length);
    const systemMessage = createSystemMessage(style, wordCount);

    console.log("Making request to OpenAI API");

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: wordCount * 2, // Approximate tokens needed for word count
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });

    if (!response.choices || response.choices.length === 0) {
      console.error("No content generated");
      throw new Error("Failed to generate content");
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    console.log("Successfully generated content");

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.CONTENT_WRITER);
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("[WRITING_ERROR]", error);
    
    // Handle OpenAI API errors
    if (error?.response?.data?.error) {
      const openAIError = error.response.data.error;
      console.error("OpenAI API error:", openAIError);
      return new NextResponse(openAIError.message || "Writing generation failed", { 
        status: error.response.status || 500 
      });
    }
    
    // Handle other errors
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}
