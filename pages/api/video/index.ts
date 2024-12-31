import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from "@clerk/nextjs";
import { checkSubscription } from "@/lib/subscription";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await auth();
    const isPro = await checkSubscription();

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isPro) {
      return res.status(403).json({ error: "Pro subscription required" });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "db6c64163be5c4d24d707a54f05419e4f2886e9241bdf1f9276368fd1ebd349e",
          input: {
            prompt,
          },
        }),
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Video generation failed" });
    }

    const prediction = await response.json();
    return res.json(prediction);
  } catch (error) {
    console.log("[VIDEO_ERROR]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
