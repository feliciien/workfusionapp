import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const isPro = await checkSubscription();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return new NextResponse("Text and target language are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning, tone, and style.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return NextResponse.json({
      translation: response.choices[0].message.content
    });
  } catch (error) {
    console.log("[TRANSLATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
