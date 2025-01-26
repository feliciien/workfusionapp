// Import necessary modules and functions
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import OpenAI from "openai";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";

// Define the interface for the request body
interface WebsitePerformanceRequestBody {
  url: string;
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
  content: `You are an expert in website performance analysis. Given a website URL, provide detailed insights on:

1. Loading speed and performance metrics.
2. SEO factors and scores.
3. Accessibility compliance.
4. Mobile responsiveness analysis.
5. Security checks for common vulnerabilities.
6. Keyword analysis, including keyword density and suggestions.
7. Actionable recommendations for improvements in all areas.

Follow these guidelines:
- Be accurate and precise.
- Use professional language suitable for a technical audience.
- Structure your response clearly with headings and bullet points where appropriate.
- Include specific examples or data points when possible.
`,
};

// Define the POST handler for the API route
export async function POST(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      console.error("[WEBSITE_PERFORMANCE_API] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check subscription status and feature usage
    const isPro = await checkSubscription();
    const hasAvailableUsage = await checkFeatureLimit(FEATURE_TYPES.WEBSITE_PERFORMANCE);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    // Parse the request body
    const body: WebsitePerformanceRequestBody = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return new NextResponse("Invalid URL provided", { status: 400 });
    }

    // Construct the prompt for OpenAI
    const prompt = `Analyze the website at the following URL: ${url}

Provide detailed insights on:

- Loading speed and performance metrics.
- SEO factors and scores.
- Accessibility compliance.
- Mobile responsiveness analysis.
- Security checks for common vulnerabilities.
- Keyword analysis, including keyword density and suggestions.
- Actionable recommendations for improvements in all areas.

Follow best practices and be thorough in your analysis.`;

    const userMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      role: "user",
      content: prompt,
    };

    // Create the chat completion request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [instructionMessage, userMessage],
      temperature: 0.7,
      max_tokens: 12000,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Increment feature usage if not a pro user
    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.WEBSITE_PERFORMANCE);
    }

    // Extract the assistant's message from the response
    const aiMessage = response.choices[0]?.message;
    if (!aiMessage) {
      throw new Error("No response from OpenAI.");
    }

    // Return the assistant's message as a JSON response
    return NextResponse.json({ analysis: aiMessage.content }, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: unknown) {
    console.error("[WEBSITE_PERFORMANCE_API_ERROR]", error);

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
