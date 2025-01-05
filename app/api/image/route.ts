import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { increaseFeatureUsage, checkFeatureLimit } from "@/lib/api-limit";
import { FEATURE_TYPES } from "@/constants";
import OpenAI from 'openai';
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const stylePrompts = {
  "realistic": "ultra realistic, photorealistic, highly detailed, 8k resolution, professional photography",
  "artistic": "artistic style, creative interpretation, vibrant colors, expressive brushstrokes",
  "anime": "anime style, manga-inspired, cel shaded, vibrant colors",
  "3d": "3D rendered, volumetric lighting, ray tracing, octane render",
  "pixel": "pixel art style, retro gaming aesthetic, 16-bit graphics",
  "cinematic": "cinematic style, dramatic lighting and composition, movie-like quality"
};

const processPrompt = (prompt: string, style: string = "realistic") => {
  const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.realistic;
  return `${prompt}. ${stylePrompt}`;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, amount = 1, resolution = "1024x1024", style = "realistic" } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const isPro = await checkSubscription(userId);
    const canGenerate = await checkFeatureLimit(userId, FEATURE_TYPES.IMAGE_GENERATION);
    
    if (!isPro && !canGenerate) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const enhancedPrompt = processPrompt(prompt, style);
    const response = await openai.images.generate({
      prompt: enhancedPrompt,
      n: parseInt(amount, 10),
      size: resolution,
    });

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.IMAGE_GENERATION);
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
