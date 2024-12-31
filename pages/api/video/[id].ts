import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from "@clerk/nextjs";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN ?? (() => {
    throw new Error("REPLICATE_API_TOKEN is not set");
  })(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await auth();
    const { id } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Prediction ID required" });
    }

    console.log("Checking status for prediction:", id);
    const prediction = await replicate.predictions.get(id as string);
    console.log("Status response:", prediction);

    if (prediction.error) {
      return res.status(500).json({ error: prediction.error });
    }

    // If the prediction is still processing, return the current status
    if (prediction.status === "starting" || prediction.status === "processing") {
      return res.json({
        status: prediction.status,
        output: null
      });
    }

    // If the prediction has completed successfully
    if (prediction.status === "succeeded" && prediction.output) {
      return res.json({
        status: "succeeded",
        output: prediction.output
      });
    }

    // If the prediction has failed
    if (prediction.status === "failed") {
      return res.status(500).json({
        status: "failed",
        error: prediction.error || "Video generation failed"
      });
    }

    // For any other status
    return res.json({
      status: prediction.status,
      output: prediction.output
    });
  } catch (error) {
    console.error("[VIDEO_STATUS_ERROR]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
