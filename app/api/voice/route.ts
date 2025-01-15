import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";

const voiceMapping: { [key: string]: string } = {
  male: "alloy",
  female: "ash",
  child: "fable",
  // Include any additional mappings if necessary
};

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

    // Map the voice parameter to the accepted values
    const mappedVoice = voiceMapping[voice] || voice || "alloy";
    console.log("Using voice:", mappedVoice); // Added for debugging

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "audio/mp3",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: mappedVoice,
        input: text,
      }),
    });

    if (!response.ok) {
      console.log("[VOICE_ERROR]", await response.text());
      return new NextResponse("Voice generation failed", { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    return NextResponse.json({ audio: `data:audio/mp3;base64,${base64Audio}` });
  } catch (error) {
    console.log("[VOICE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
