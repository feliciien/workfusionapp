import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(configuration);

type OpenAIVoice = "alloy" | "echo" | "fable" | "nova" | "onyx" | "shimmer";

const VOICE_MAPPINGS: Record<string, OpenAIVoice> = {
  male: "echo",     // Deep male voice
  female: "nova",   // Female voice
  child: "alloy",   // Young voice
};

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, voice, emotion, speed, pitch } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.apiKey) {
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

    // Add emotion to the prompt
    let enhancedPrompt = prompt;
    if (emotion && emotion !== "neutral") {
      switch(emotion) {
        case "happy":
          enhancedPrompt = `[Speaking with enthusiasm and joy] ${prompt}`;
          break;
        case "sad":
          enhancedPrompt = `[Speaking with sadness and melancholy] ${prompt}`;
          break;
        case "angry":
          enhancedPrompt = `[Speaking with anger and intensity] ${prompt}`;
          break;
        default:
          enhancedPrompt = prompt;
      }
    }

    const selectedVoice: OpenAIVoice = VOICE_MAPPINGS[voice as keyof typeof VOICE_MAPPINGS] || "echo";

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: enhancedPrompt,
      speed: speed || 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Only increase the API limit count for non-pro users
    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      audio: audioDataUrl,
      remaining: freeTrial ? await checkApiLimit() : null,
      isPro
    });
  } catch (error) {
    console.log('[VOICE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
