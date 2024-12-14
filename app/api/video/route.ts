import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("Missing REPLICATE_API_TOKEN environment variable");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

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

    console.log("Starting video generation with prompt:", prompt);

    // Use the text-to-video-zero model
    const prediction = await replicate.run(
      "anotherjesse/zeroscope-v2-xl:71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f",
      {
        input: {
          prompt,
          num_frames: 24,
          fps: 12
        }
      }
    );

    console.log("Generation completed. Output:", prediction);

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(prediction);

  } catch (error) {
    console.error('[VIDEO_ERROR] Full error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
  }
}