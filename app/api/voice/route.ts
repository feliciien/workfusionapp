import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, voice } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice === "male" ? "onyx" : voice === "female" ? "nova" : "alloy",
      input: prompt,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(audioDataUrl);
  } catch (error) {
    console.log('[VOICE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
