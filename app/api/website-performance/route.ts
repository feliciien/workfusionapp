import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { checkSubscription } from "@/lib/subscription";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { FEATURE_TYPES } from "@/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PerformanceMetrics {
  loadingSpeed: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
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
      loadingSpeed: Math.random() * 3 + 1, // 1-4 seconds
      firstContentfulPaint: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
      timeToInteractive: Math.random() * 4 + 2, // 2-6 seconds
      performanceScore: Math.floor(Math.random() * 30 + 70), // 70-100
      seoScore: Math.floor(Math.random() * 20 + 80), // 80-100
      accessibilityScore: Math.floor(Math.random() * 25 + 75), // 75-100
    };

    // Generate insights using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a website performance and SEO expert. Analyze the provided metrics and generate actionable insights."
        },
        {
          role: "user",
          content: `Analyze these website metrics for ${url}:\n${JSON.stringify(metrics, null, 2)}\n\nProvide specific recommendations for SEO, accessibility, and performance improvements.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiSuggestions = response.choices[0].message.content;
    let parsedSuggestions;
    
    try {
      parsedSuggestions = JSON.parse(aiSuggestions || "{}");
    } catch {
      // If AI response isn't valid JSON, create a basic structure from the text
      const suggestions = (aiSuggestions || "").split("\n").filter(Boolean);
      parsedSuggestions = {
        seoInsights: suggestions.filter(s => s.toLowerCase().includes("seo")),
        accessibilityIssues: suggestions.filter(s => s.toLowerCase().includes("accessibility")),
        performanceRecommendations: suggestions.filter(s => s.toLowerCase().includes("performance"))
      };
    }

    const analysisResult: WebsiteAnalysisResponse = {
      metrics,
      seoInsights: parsedSuggestions.seoInsights || [],
      accessibilityIssues: parsedSuggestions.accessibilityIssues || [],
      performanceRecommendations: parsedSuggestions.performanceRecommendations || []
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