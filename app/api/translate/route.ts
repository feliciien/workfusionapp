import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionFromRequest } from "@/lib/jwt";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, targetLanguage = 'English' } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
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
          content: `You are a professional translator. Translate the following text into ${targetLanguage}. Maintain the original meaning, tone, and style while ensuring natural and fluent translation.`
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
    console.error("[TRANSLATE_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
