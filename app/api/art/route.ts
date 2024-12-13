import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stylePrompts = {
  "realistic": "ultra realistic, photorealistic, highly detailed",
  "anime": "anime style, manga art, vibrant colors",
  "digital-art": "digital art, modern, clean lines",
  "oil-painting": "oil painting style, textured, classical art",
  "watercolor": "watercolor painting, soft edges, artistic",
  "sketch": "pencil sketch, hand-drawn, detailed linework",
  "abstract": "abstract art, non-representational, modern art",
  "3d-render": "3D rendered, CGI, photorealistic render"
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512", style = "realistic" } = body;

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

    // Enhance prompt with selected style
    const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || ""}`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: parseInt(amount, 10),
      size: resolution as "256x256" | "512x512" | "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      images: response.data,
      remaining: await checkApiLimit(),
      isPro
    });
  } catch (error) {
    console.log('[ART_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
