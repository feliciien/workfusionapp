import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureLimit, increaseFeatureUsage } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const isPro = await checkSubscription(userId);
    const canGenerate = await checkFeatureLimit(userId, FEATURE_TYPES.MUSIC_CREATION);
    
    if (!isPro && !canGenerate) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // First check if API key is configured
    const apiKey = process.env.HUGGINGFACE_TOKEN;
    if (!apiKey) {
      throw new Error("Hugging Face API key not configured");
    }

    console.log("Making request to Hugging Face API with prompt:", prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "audio/wav",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error details:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorText
      });
      throw new Error(`Hugging Face API error: ${response.statusText}. Details: ${errorText}`);
    }

    console.log("Received successful response from Hugging Face API");

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("audio/")) {
      console.error("Unexpected content type:", contentType);
      const responseText = await response.text();
      console.error("Response body:", responseText);
      throw new Error("Invalid response format from Hugging Face API");
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Received audio buffer of size:", audioBuffer.byteLength);

    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.MUSIC_CREATION);
    }

    return NextResponse.json({ audio: audioUrl });
  } catch (error) {
    console.error("[MUSIC_ERROR]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}