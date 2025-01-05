import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getSessionFromRequest } from "@/lib/jwt";
import { checkSubscription } from "@/lib/subscription";
import { incrementFeatureUsage, checkFeatureLimit } from "@/lib/feature-limit";
import { FEATURE_TYPES } from "@/constants";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, voice, emotion, speed, pitch } = body;

    if (!prompt) {
      return new NextResponse("Text is required", { status: 400 });
    }

    // Check subscription and limits
    const isPro = await checkSubscription(userId);
    const usage = await checkFeatureLimit(userId, FEATURE_TYPES.VOICE_SYNTHESIS);

    if (!isPro && usage >= 5) {
      return new NextResponse("Free tier limit reached", { status: 403 });
    }

    // Map voice and emotion to ElevenLabs voice IDs
    const voiceMap: Record<string, string> = {
      'male': '21m00Tcm4TlvDq8ikWAM',    // Josh
      'female': 'EXAVITQu4vr4xnSDxMaL',  // Elli
      'child': 'pNInz6obpgDQGcFmaJgB'    // Sam
    };

    const stabilityMap: Record<string, number> = {
      'neutral': 0.5,
      'happy': 0.75,
      'sad': 0.25,
      'angry': 0.9
    };

    const voiceId = voiceMap[voice] || '21m00Tcm4TlvDq8ikWAM';
    const stability = stabilityMap[emotion] || 0.5;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY!,
        },
        body: JSON.stringify({
          text: prompt,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability,
            similarity_boost: 0.75,
            style: 1.0,
            use_speaker_boost: true,
            speaking_rate: speed,
            pitch_scale: pitch
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error("ElevenLabs API error:", error);
      return new NextResponse("Voice generation failed", { status: 500 });
    }

    // Increment usage for free users
    if (!isPro) {
      await incrementFeatureUsage(userId, FEATURE_TYPES.VOICE_SYNTHESIS);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    // Get updated count
    const remaining = isPro ? -1 : 5 - (await checkFeatureLimit(userId, FEATURE_TYPES.VOICE_SYNTHESIS));

    return NextResponse.json({ 
      audio: `data:audio/mpeg;base64,${base64Audio}`,
      remaining,
      isPro
    });
  } catch (error) {
    console.error("[VOICE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
