// app/api/translate/route.ts

import { authOptions } from "@/lib/auth-options";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const isPro = await checkSubscription();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return new NextResponse("Text and target language are required", {
        status: 400
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

    const translation = response.choices[0]?.message?.content?.trim();

    if (!translation) {
      return new NextResponse("Translation failed", { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        data: {
          translation
        }
      }
    });
  } catch (error: any) {
    console.error("[TRANSLATE_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
