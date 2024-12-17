import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stylePrompts = {
  "realistic": "ultra realistic, photorealistic, highly detailed, 8k resolution",
  "anime": "anime style, manga art, vibrant colors, Studio Ghibli inspired",
  "digital-art": "digital art, modern, clean lines, professional illustration",
  "oil-painting": "oil painting style, textured, classical art, masterpiece quality",
  "watercolor": "watercolor painting, soft edges, artistic, traditional media",
  "sketch": "detailed pencil sketch, hand-drawn, professional illustration, fine linework",
  "abstract": "abstract art, non-representational, modern art, creative composition",
  "3d-render": "3D rendered, CGI, photorealistic render, octane render, high detail",
  "fantasy": "fantasy art style, magical, ethereal, detailed worldbuilding",
  "surreal": "surrealist art style, dreamlike, imaginative, Salvador Dali inspired"
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
  processedPrompt += ", masterpiece, best quality, highly detailed, sharp focus, professional, trending on artstation";
  
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
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Validate prompt length
    if (prompt.length < 3) {
      return new NextResponse("Prompt too short. Please provide more details.", { status: 400 });
    }

    if (prompt.length > 4000) {
      return new NextResponse("Prompt too long. Maximum length is 4000 characters.", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Process and enhance the prompt
    const enhancedPrompt = processPrompt(prompt, style);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1, // DALL-E-3 only supports n=1
      size: resolution === "1792x1024" ? "1792x1024" : "1024x1024", // Only these sizes are supported by DALL-E-3
      quality: "standard",
      style: "vivid", // Enhanced creativity
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      images: response.data,
      remaining: await checkApiLimit(),
      isPro
    });
  } catch (error: any) {
    console.log('[ART_ERROR]', error);
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
