// app/api/research/route.ts

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

const researchInstructions = {
  academic:
    "You are a research assistant helping with academic research. Focus on scholarly sources, methodologies, and academic insights.",
  market:
    "You are a market research analyst. Focus on market trends, consumer behavior, and business insights.",
  scientific:
    "You are a scientific research assistant. Focus on scientific methodologies, data analysis, and research findings.",
  literature:
    "You are a literature review specialist. Focus on analyzing and synthesizing existing research and publications.",
  trends:
    "You are a trend analyst. Focus on identifying and analyzing current and emerging trends.",
  competitive:
    "You are a competitive analysis specialist. Focus on analyzing competitors, market positioning, and strategic insights.",
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await req.json();
    const { messages, researchType } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.RESEARCH_ASSISTANT),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    const systemMessage = {
      role: "system",
      content:
        researchInstructions[
          researchType as keyof typeof researchInstructions
        ] || researchInstructions.academic,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.RESEARCH_ASSISTANT);
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[RESEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
