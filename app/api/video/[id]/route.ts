import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.id) {
      return new NextResponse("Prediction ID required", { status: 400 });
    }

    console.log("Checking status for prediction:", params.id);
    const prediction = await replicate.predictions.get(params.id);
    console.log("Status response:", prediction);

    if (prediction.error) {
      return new NextResponse(prediction.error, { status: 500 });
    }

    // If the prediction is still processing, return the current status
    if (prediction.status === "starting" || prediction.status === "processing") {
      return NextResponse.json({
        status: prediction.status,
        output: null
      });
    }

    // If the prediction has completed successfully
    if (prediction.status === "succeeded" && prediction.output) {
      return NextResponse.json({
        status: "succeeded",
        output: prediction.output
      });
    }

    // If the prediction has failed
    if (prediction.status === "failed") {
      return NextResponse.json({
        status: "failed",
        error: prediction.error || "Video generation failed"
      });
    }

    // Default response for other statuses
    return NextResponse.json({
      status: prediction.status,
      output: prediction.output
    });

  } catch (error) {
    console.error('[VIDEO_STATUS_ERROR]', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return new NextResponse("Error checking video status", { status: 500 });
  }
}
