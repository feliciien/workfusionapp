import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("Missing REPLICATE_API_TOKEN environment variable");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, num_frames = 14, fps = 6 } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    console.log("Making request to Replicate API...");
    
    const response = await replicate.run(
      "stability-ai/stable-video-diffusion:3d60c49b398705475c457f87f3f0c284cc29fcc05fed9f1ae489003ddc1634b1",
      {
        input: {
          prompt,
          num_frames,
          fps,
        }
      }
    );

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in video generation:", error);
    if (error.response?.status === 422) {
      return new NextResponse("Invalid model configuration. Please try different parameters.", { status: 422 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}