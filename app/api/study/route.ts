import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionFromRequest } from "@/lib/jwt";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STUDY_PROMPTS = {
  flashcards: "Create study flashcards with questions on one side and answers on the other.",
  summary: "Create a concise summary of the key concepts and main points.",
  quiz: "Create a quiz with multiple-choice questions and explanations for the answers.",
  mindmap: "Create a mind map showing the relationships between key concepts.",
  timeline: "Create a chronological timeline of important events and developments."
};

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, studyType = 'summary' } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Check user limits
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
          content: STUDY_PROMPTS[studyType as keyof typeof STUDY_PROMPTS] || STUDY_PROMPTS.summary
        },
        {
          role: "user",
          content
        }
      ]
    });

    if (!isPro) {
      await increaseApiLimit(userId);
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.error("[STUDY_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
