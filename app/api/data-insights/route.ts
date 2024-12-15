import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;

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
          content: `You are a data analysis expert. Analyze the following data and provide:
          1. Key metrics and their values
          2. Notable trends and patterns
          3. Actionable recommendations
          
          Focus on:
          - Key performance indicators (KPIs)
          - Growth rates and changes over time
          - Correlations between different metrics
          - Areas for improvement
          - Actionable insights
          
          Format your response as JSON with the following structure:
          {
            "metrics": {
              "key_metric_name": number or string value,
              // Include 3-6 most important metrics
            },
            "trends": [
              "Detailed trend observation 1",
              "Detailed trend observation 2",
              // Include 3-5 significant trends
            ],
            "recommendations": [
              "Specific actionable recommendation 1",
              "Specific actionable recommendation 2",
              // Include 3-5 practical recommendations
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
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!response.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    const analysisResult = JSON.parse(response.choices[0].message.content) as DataInsightsResponse;

    // Validate response structure
    if (
      !analysisResult.metrics ||
      !Array.isArray(analysisResult.trends) ||
      !Array.isArray(analysisResult.recommendations)
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
