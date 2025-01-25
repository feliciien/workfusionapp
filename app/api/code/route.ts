// Import necessary modules and functions
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FEATURE_TYPES } from "@/constants";

// Define the interface for the code request body
interface CodeRequestBody {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  language?: string;
}

// Check for the OpenAI API key in environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the instruction message for the assistant
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
8. Include example usage where appropriate`,
};

// Define the POST handler for the API route
export async function POST(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      console.error("[CODE_API] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check subscription status and feature usage
    const isPro = await checkSubscription();
    const hasAvailableUsage = await checkFeatureLimit(FEATURE_TYPES.CODE_GENERATION);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    // Parse the request body
    const body: CodeRequestBody = await req.json();
    const { messages, language } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new NextResponse("Messages are required and must be an array", { status: 400 });
    }

    // Construct system message with optional language context
    const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      ...instructionMessage,
      content:
        instructionMessage.content +
        (language ? `\nGenerate code in ${language}.` : ""),
    };

    // Create the chat completion request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k", // Updated to use gpt-3.5-turbo-16k for longer outputs
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 12000, // Increased max_tokens for longer outputs
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Increment feature usage if not a pro user
    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.CODE_GENERATION);
    }

    // Extract the assistant's message from the response
    const aiMessage = response.choices[0]?.message;
    if (!aiMessage) {
      throw new Error("No response from OpenAI.");
    }

    // Return the assistant's message as a JSON response
    return NextResponse.json(aiMessage, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: unknown) {
    console.error("[CODE_API_ERROR]", error);

    // Handle OpenAI API errors
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

    // Handle other errors
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: 500 }
    );
  }
}
