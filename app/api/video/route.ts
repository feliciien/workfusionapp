import { NextResponse } from 'next/server';

const RUNWAY_API_URL = "https://api.runwayml.com/v1/generate"; // Ensure the endpoint is correct

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("Received prompt for video:", prompt);

    if (!process.env.RUNWAY_API_KEY) {
      throw new Error("RUNWAY_API_KEY not set in .env.local");
    }

    const payload = {
      prompt, // Adjust the field name if needed based on Runway's API documentation
      // Include any additional parameters required by the API (e.g., duration, resolution, etc.)
    };

    const response = await fetch(RUNWAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06", // Set the correct API version as per documentation
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Runway API error:", errorText);
      return NextResponse.json({ error: "Error generating video." }, { status: 500 });
    }

    const data = await response.json();

    // Assuming the API response contains a field "video_url".
    const videoUrl = data.video_url;
    if (!videoUrl) {
      console.error("No video URL returned from Runway.");
      return NextResponse.json({ error: "No video returned." }, { status: 500 });
    }

    return NextResponse.json({ video: videoUrl });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json({ error: "Error generating video." }, { status: 500 });
  }
}