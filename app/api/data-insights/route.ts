import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Set to maximum allowed for hobby plan

interface DataInsightsResponse {
  metrics: Record<string, number | string>;
  trends: string[];
  recommendations: string[];
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    const { data } = await req.json();

    if (!data || typeof data !== "object") {
      return new NextResponse("Data is required and must be a valid JSON object", { status: 400 });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.DATA_INSIGHTS),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",  // Use a faster model with better JSON capabilities
      response_format: { type: "json_object" },  // Force JSON response
      messages: [
        {
          role: "system",
          content: `You are a data analysis expert. Analyze the provided data and return insights in the following JSON format:
{
  "metrics": {
    "key_metric_1": "value1",
    "key_metric_2": "value2"
  },
  "trends": [
    "trend description 1",
    "trend description 2"
  ],
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2"
  ]
}

Make sure all insights are:
1. Data-driven and specific
2. Business-focused
3. Actionable and practical

Return ONLY valid JSON, no additional text.`
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      temperature: 0.5,  // Lower temperature for more consistent JSON
      max_tokens: 2000,
      top_p: 1,
    });

    if (!response.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    let analysisResult: DataInsightsResponse;
    try {
      analysisResult = JSON.parse(response.choices[0].message.content);
      
      // Validate response structure
      if (
        !analysisResult ||
        typeof analysisResult !== 'object' ||
        !analysisResult.metrics ||
        !Array.isArray(analysisResult.trends) ||
        !Array.isArray(analysisResult.recommendations)
      ) {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("[DATA_INSIGHTS_PARSE_ERROR]", error);
      console.error("Raw response:", response.choices[0].message.content);
      return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
    }

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.DATA_INSIGHTS);
    }

    return NextResponse.json({
      data: analysisResult
    });

  } catch (error: any) {
    console.error("[DATA_INSIGHTS_ERROR]", error);
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
