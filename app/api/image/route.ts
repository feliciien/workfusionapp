import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Style enhancements for different image types
const stylePrompts = {
  "realistic": "ultra realistic, photorealistic, highly detailed",
  "artistic": "artistic style, creative interpretation",
  "digital": "digital art style, modern aesthetic",
  "vintage": "vintage style, retro aesthetic",
  "minimalist": "minimalist style, clean and simple",
  "fantasy": "fantasy art style, magical and ethereal",
  "comic": "comic book style, bold colors and lines",
  "cinematic": "cinematic style, dramatic lighting and composition"
};

// Helper function to process and enhance the prompt
const processPrompt = (prompt: string, style: string = "realistic") => {
  // Clean the prompt
  let processedPrompt = prompt.trim();
  
  // Add style enhancement
  const styleEnhancement = stylePrompts[style as keyof typeof stylePrompts] || "";
  
  // Combine prompt with style
  processedPrompt = `${processedPrompt}, ${styleEnhancement}`;
  
  // Add quality boosting terms
  processedPrompt += ", best quality, highly detailed, sharp focus, professional";
  
  return processedPrompt;
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "1024x1024", style = "realistic" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    // Validate prompt length
    if (prompt.length < 3) {
      return new NextResponse("Prompt too short. Please provide more details.", { status: 400 });
    }

    if (prompt.length > 4000) {
      return new NextResponse("Prompt too long. Maximum length is 4000 characters.", { status: 400 });
    }

    const isAllowed = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!isAllowed && !isPro) {
      return new NextResponse("API Limit Exceeded", { status: 403 });
    }

    // Process and enhance the prompt
    const enhancedPrompt = processPrompt(prompt, style);

    const response = await openai.images.generate({
      model: "dall-e-3", // Using DALL-E 3 for better quality
      prompt: enhancedPrompt,
      n: 1, // DALL-E 3 only supports n=1
      size: resolution === "1792x1024" ? "1792x1024" : "1024x1024", // DALL-E 3 supported sizes
      quality: "standard",
      style: "vivid", // This parameter helps with more creative interpretations
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
