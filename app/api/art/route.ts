import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureLimit, increaseFeatureUsage } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
  // Clean and enhance the prompt
  let processedPrompt = prompt.trim();
  
  // Add style enhancement
  const styleEnhancement = stylePrompts[style as keyof typeof stylePrompts] || "";
  
  // Combine prompt with style
  processedPrompt = `${processedPrompt}, ${styleEnhancement}`;
  
  // Add quality boosting terms
  processedPrompt += ", masterpiece, best quality, highly detailed, sharp focus, professional, trending on artstation, 8k uhd, high resolution";
  
  return processedPrompt;
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

    // Validate prompt length
    if (prompt.length < 3) {
      return new NextResponse("Prompt too short. Please provide more details.", { status: 400 });
    }

    if (prompt.length > 4000) {
      return new NextResponse("Prompt too long. Maximum length is 4000 characters.", { status: 400 });
    }

    const isPro = await checkSubscription(userId);
    const canGenerate = await checkFeatureLimit(userId, FEATURE_TYPES.IMAGE_GENERATION);

    if (!isPro && !canGenerate) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Process and enhance the prompt
    const enhancedPrompt = processPrompt(prompt, style);

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return new NextResponse("Art generation service not configured", { status: 500 });
    }

    console.log("Making request to OpenAI API with prompt:", enhancedPrompt);

    const response = await openai.images.generate({
      prompt: enhancedPrompt,
      n: parseInt(amount.toString(), 10),
      size: resolution as "1024x1024" | "512x512" | "256x256",
      quality: "standard",
      model: "dall-e-2",
    });

    if (!response.data || response.data.length === 0) {
      console.error("No images generated");
      throw new Error("Failed to generate images");
    }

    console.log("Successfully generated images");

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.IMAGE_GENERATION);
    }

    // Transform the response to match the expected format
    const images = response.data.map(image => ({
      url: image.url
    }));

    return NextResponse.json(images);
  } catch (error: any) {
    console.error("[ART_ERROR]", error);
    
    // Handle OpenAI API errors
    if (error?.response?.data?.error) {
      const openAIError = error.response.data.error;
      console.error("OpenAI API error:", openAIError);
      return new NextResponse(openAIError.message || "Art generation failed", { 
        status: error.response.status || 500 
      });
    }
    
    // Handle other errors
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}
