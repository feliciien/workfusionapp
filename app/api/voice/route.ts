import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const isPro = await checkSubscription();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const { text, voice } = await req.json();

    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/" + (voice || "21m00Tcm4TlvDq8ikWAM"),
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      return new NextResponse("Voice generation failed", { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    return NextResponse.json({ audio: `data:audio/mpeg;base64,${base64Audio}` });
  } catch (error) {
    console.log("[VOICE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
