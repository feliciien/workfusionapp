/** @format */

import { FEATURE_TYPES } from "@/constants";
import { authOptions } from "@/lib/auth-options";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface PerformanceMetrics {
  loadingSpeed: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  mobileResponsiveness: number;
  crossBrowserScore: number;
  timestamp: string;
}

interface WebsiteAnalysisResponse {
  metrics: PerformanceMetrics;
  seoInsights: string[];
  accessibilityIssues: string[];
  performanceRecommendations: string[];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new NextResponse("Website URL is required", { status: 400 });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.WEBSITE_PERFORMANCE),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    // Simulate performance metrics collection
    // In a production environment, you would use real performance testing tools
    const metrics: PerformanceMetrics = {
      loadingSpeed: Math.random() * 3 + 1,
      firstContentfulPaint: Math.random() * 2 + 0.5,
      timeToInteractive: Math.random() * 4 + 2,
      performanceScore: Math.floor(Math.random() * 30 + 70),
      seoScore: Math.floor(Math.random() * 20 + 80),
      accessibilityScore: Math.floor(Math.random() * 25 + 75),
      largestContentfulPaint: Math.random() * 4 + 2,
      cumulativeLayoutShift: Math.random() * 0.5,
      firstInputDelay: Math.random() * 200 + 50,
      mobileResponsiveness: Math.floor(Math.random() * 20 + 80),
      crossBrowserScore: Math.floor(Math.random() * 15 + 85),
      timestamp: new Date().toISOString()
    };

    // Generate insights using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a website performance and SEO expert. Analyze the provided metrics and generate clear, actionable recommendations. Format your response as a JSON object with three arrays: 'seoInsights', 'accessibilityIssues', and 'performanceRecommendations'. Each array should contain complete, well-written sentences that explain the issue and provide specific solutions. Do not use markdown formatting or bullet points."
        },
        {
          role: "user",
          content: `Analyze these website metrics for ${url}:\n${JSON.stringify(metrics, null, 2)}\n\nProvide specific recommendations for SEO, accessibility, and performance improvements in clear, natural language.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const aiSuggestions = response.choices[0].message.content;
    let parsedSuggestions;

    try {
      parsedSuggestions = JSON.parse(aiSuggestions || "{}");
    } catch {
      // If AI response isn't valid JSON, create a basic structure from the text
      const suggestions = (aiSuggestions || "").split("\n").filter(Boolean);
      parsedSuggestions = {
        seoInsights: suggestions.filter((s) => s.toLowerCase().includes("seo")),
        accessibilityIssues: suggestions.filter((s) =>
          s.toLowerCase().includes("accessibility")
        ),
        performanceRecommendations: suggestions.filter((s) =>
          s.toLowerCase().includes("performance")
        )
      };
    }

    const analysisResult: WebsiteAnalysisResponse = {
      metrics,
      seoInsights: parsedSuggestions.seoInsights || [],
      accessibilityIssues: parsedSuggestions.accessibilityIssues || [],
      performanceRecommendations:
        parsedSuggestions.performanceRecommendations || []
    };

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.WEBSITE_PERFORMANCE);
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("[WEBSITE_PERFORMANCE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
