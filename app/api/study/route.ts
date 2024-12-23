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
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new NextResponse("Query is required and must be a string", { status: 400 });
    }

    if (query.length > 1000) {
      return new NextResponse("Query is too long. Maximum length is 1000 characters", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

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
    });

    if (!response.choices[0].message.content) {
      return new NextResponse("Failed to generate response", { status: 500 });
    }

    // Increase the API limit
    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      success: true,
      answer: response.choices[0].message.content
    });

  } catch (error) {
    console.error("[STUDY_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
