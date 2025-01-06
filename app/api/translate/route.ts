import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import OpenAI from "openai";

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
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return new NextResponse("Text and target language are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription(userId);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning, tone, and style while ensuring the translation is natural and fluent in the target language.`
      },
      {
        role: "user" as const,
        content: text
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!isPro) {
      await increaseApiLimit(userId);
    }

    return NextResponse.json({
      translation: response.choices[0].message.content,
      targetLanguage
    });
  } catch (error) {
    console.error("[TRANSLATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
