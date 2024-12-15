import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

interface CodeAnalysisResponse {
  score: number;
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    message: string;
    line?: number;
  }>;
  suggestions: string[];
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return new NextResponse("Code is required and must be a string", { status: 400 });
    }

    if (code.length > 10000) {
      return new NextResponse("Code is too long. Maximum length is 10000 characters", { status: 400 });
    }

    let freeTrial = true;
    let isPro = false;

    try {
      freeTrial = await checkApiLimit();
      isPro = await checkSubscription();
    } catch (error) {
      console.error("Error checking API limits:", error);
      // Continue with free trial if there's an error checking limits
      freeTrial = true;
      isPro = false;
    }

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a code analysis expert. Analyze the following code and provide:
          1. A code quality score out of 100
          2. A list of potential issues with severity levels
          3. Suggestions for improvement
          
          Format your response as JSON with the following structure:
          {
            "score": number (0-100),
            "issues": [
              {
                "severity": "high" | "medium" | "low",
                "message": "string",
                "line": number (optional)
              }
            ],
            "suggestions": ["string"]
          }
          
          Focus on:
          - Code quality and best practices
          - Potential bugs and security issues
          - Performance considerations
          - Maintainability and readability
          - Design patterns and architecture
          
          Return ONLY valid JSON, no additional text.`
        },
        {
          role: "user",
          content: code
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!response.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    const analysisResult = JSON.parse(response.choices[0].message.content) as CodeAnalysisResponse;

    // Validate response structure
    if (
      typeof analysisResult.score !== 'number' ||
      !Array.isArray(analysisResult.issues) ||
      !Array.isArray(analysisResult.suggestions)
    ) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Only try to increase API limit if we successfully checked it
    if (!isPro) {
      try {
        await increaseApiLimit();
      } catch (error) {
        console.error("Error increasing API limit:", error);
        // Continue anyway since we've already generated the content
      }
    }

    return NextResponse.json({
      data: analysisResult
    });

  } catch (error: any) {
    console.error("[CODE_ANALYSIS_ERROR]", error);
    if (error.code === "P2024") {
      return NextResponse.json({
        error: "Database connection error. Please try again."
      }, { status: 500 });
    }
    if (error.message === "Invalid response format from OpenAI") {
      return NextResponse.json({
        error: "Failed to generate analysis. Please try again."
      }, { status: 500 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
