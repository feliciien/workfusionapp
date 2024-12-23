import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured"
      }, { status: 500 });
    }

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({
        success: false,
        error: "Query is required and must be a string"
      }, { status: 400 });
    }

    if (query.length > 1000) {
      return NextResponse.json({
        success: false,
        error: "Query is too long. Maximum length is 1000 characters"
      }, { status: 400 });
    }

    // Check user limits
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return NextResponse.json({
        success: false,
        error: "Free trial has expired. Please upgrade to pro."
      }, { status: 403 });
    }

    // Set timeout for OpenAI request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert tutor specializing in breaking down complex topics into clear, understandable explanations.

Your responses should follow this structure:

1. Start with a brief, engaging introduction to the topic
2. Break down the main concepts into clear sections using markdown headers
3. Use analogies and real-world examples to illustrate complex ideas
4. Include key points and takeaways
5. End with a brief summary or conclusion

Guidelines for your explanations:
- Use clear, concise language suitable for the topic's complexity level
- Include relevant examples and analogies
- Use markdown formatting for better readability (headers, bullet points, bold, etc.)
- Keep explanations focused and well-structured
- Add relevant formulas or diagrams using markdown when applicable
- Highlight important terms or concepts using bold or italics

Format your response in proper markdown for optimal readability.`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!response.choices[0].message?.content) {
        throw new Error("No content in response");
      }

      // Increase the API limit for non-pro users
      if (!isPro) {
        await increaseApiLimit();
      }

      return NextResponse.json({
        success: true,
        data: {
          answer: response.choices[0].message.content
        }
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: "Request timed out"
        }, { status: 504 });
      }
      throw error; // Re-throw to be caught by outer catch block
    }

  } catch (error: any) {
    console.error("[STUDY_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}
