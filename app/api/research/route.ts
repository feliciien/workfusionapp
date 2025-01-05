import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionFromRequest } from "@/lib/jwt";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RESEARCH_PROMPTS = {
  academic: "You are a research expert. Provide detailed academic research with citations and references.",
  market: "You are a market research analyst. Provide detailed market analysis with data and trends.",
  scientific: "You are a scientific researcher. Provide detailed scientific research with methodology and findings.",
  literature: "You are a literature review specialist. Focus on analyzing and synthesizing existing research and publications.",
  trends: "You are a trend analyst. Focus on identifying and analyzing current and emerging trends.",
  competitive: "You are a competitive analysis specialist. Focus on analyzing competitors, market positioning, and strategic insights.",
};

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, researchType = 'academic' } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription(userId);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: RESEARCH_PROMPTS[researchType as keyof typeof RESEARCH_PROMPTS] || RESEARCH_PROMPTS.academic
        },
        ...messages
      ]
    });

    if (!isPro) {
      await increaseApiLimit(userId);
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.error("[RESEARCH_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
