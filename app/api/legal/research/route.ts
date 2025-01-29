/** @format */

import { FEATURE_TYPES } from "@/constants";
import { authOptions } from "@/lib/auth-options";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const body = await req.json();
    const { query } = body;

    if (!userId) {
      console.error("[LEGAL_RESEARCH_API] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!query) {
      return new NextResponse("Query is required", { status: 400 });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.LEGAL_RESEARCH),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable legal research assistant with expertise in legal analysis and research. Structure your responses with clear sections covering: 1) Legal principles and doctrines, 2) Applicable statutes and regulations, 3) Key case law precedents with citations, 4) Legal analysis and reasoning, 5) Practical implications and recommendations."
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.LEGAL_RESEARCH);
    }

    const aiMessage = response.choices[0]?.message;
    if (!aiMessage) {
      throw new Error("No response from OpenAI.");
    }

    const enhancedResponse = {
      content: aiMessage.content,
      metadata: {
        model: "gpt-4-1106-preview",
        timestamp: new Date().toISOString(),
        queryType: "legal_research"
      }
    };

    return NextResponse.json(enhancedResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (error: unknown) {
    console.error("[LEGAL_RESEARCH_ERROR]", error);

    if (error instanceof OpenAI.APIError) {
      return new NextResponse(
        JSON.stringify({
          error: "OpenAI API Error",
          message: error.message,
          code: error.code
        }),
        { status: error.status || 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred"
      }),
      { status: 500 }
    );
  }
}
