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
          content: `You are an expert tutor. Your goal is to help students understand complex topics by:
          1. Breaking down complex concepts into simple terms
          2. Providing clear examples
          3. Adding relevant analogies when helpful
          4. Including key points to remember
          
          Keep your explanations clear, engaging, and educational.
          Format your response with proper markdown for better readability.`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!response.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      data: {
        answer: response.choices[0].message.content
      }
    });

  } catch (error: any) {
    console.error("[STUDY_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal Error" },
      { status: error.code === "P2003" ? 401 : 500 }
    );
  }
}
