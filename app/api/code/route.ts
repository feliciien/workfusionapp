import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Analytics } from '@vercel/analytics/react';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: OpenAI.Chat.ChatCompletionMessageParam = {
  role: "system",
  content: `You are an expert code generator. Follow these rules:
1. Always respond with properly formatted markdown code snippets
2. Include detailed comments explaining the code
3. Use best practices and modern syntax
4. Include necessary imports and dependencies
5. Handle errors and edge cases
6. If the user specifies a language, use that language
7. Format the code properly with correct indentation
8. Include example usage where appropriate`
};

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    console.log("[CODE_API] Checking access for user:", userId);

    if (!userId) {
      console.log("[CODE_API] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription();

    if (!isPro) {
      const hasApiLimit = await checkApiLimit();

      if (!hasApiLimit) {
        return new NextResponse("Free tier limit reached", { status: 403 });
      }
    }

    const body = await req.json();
    const { messages, language } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // Add language context to the system message if specified
    const systemMessage = language 
      ? {
          ...instructionMessage,
          content: `${instructionMessage.content}\nGenerate code in ${language}.`,
        }
      : instructionMessage;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Only increase the API limit count for free users
    if (!isPro) {
      await increaseApiLimit();
    }

    if (!response.choices[0].message) {
      throw new Error("No response from OpenAI");
    }

    return NextResponse.json(response.choices[0].message, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error("[CODE_API_ERROR]", error instanceof Error ? error.message : error);

    // Return more specific error messages
    if (error instanceof OpenAI.APIError) {
      return new NextResponse(
        JSON.stringify({
          error: "OpenAI API Error",
          message: error.message,
          code: error.code,
        }),
        { status: error.status || 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500 }
    );
  }
}
