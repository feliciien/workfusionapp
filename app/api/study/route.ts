// Import necessary packages
import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!openai.apiKey) {
  throw new Error('OpenAI API key not configured');
}

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
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
    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.STUDY_ASSISTANT),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return NextResponse.json({
        success: false,
        error: "Free usage limit reached. Please upgrade to pro for unlimited access."
      }, { status: 403 });
    }

    try {
      const response = await openai.chat.completions.create(
        {
          model: "gpt-3.5-turbo",
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
        },
        {
          timeout: 30000, // Set timeout in milliseconds
        }
      );

      const responseText = response.choices[0]?.message?.content?.trim();

      if (!responseText) {
        console.error('OpenAI response is empty');
        return NextResponse.json(
          { success: false, error: 'Failed to generate response' },
          { status: 500 }
        );
      }

      // Increment feature usage for non-pro users
      if (!isPro) {
        await incrementFeatureUsage(FEATURE_TYPES.STUDY_ASSISTANT);
      }

      return NextResponse.json({
        success: true,
        data: {
          answer: responseText
        }
      });

    } catch (error: any) {
      if (error.name === 'APIUserAbortError' || error.name === 'AbortError') {
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
