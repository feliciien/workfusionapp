import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureLimit, increaseFeatureUsage } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

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

    const response = await replicate.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: prompt,
        },
      }
    );

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.MUSIC_CREATION);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[MUSIC_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}