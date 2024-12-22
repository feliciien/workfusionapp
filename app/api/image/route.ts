import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { Redis } from '@upstash/redis';

// Initialize Redis client for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

// Style enhancements for different image types
const stylePrompts = {
  "realistic": "ultra realistic, photorealistic, highly detailed, 8k resolution, professional photography, masterpiece quality",
  "artistic": "artistic style, creative interpretation, vibrant colors, expressive brushstrokes, masterpiece quality, trending on artstation",
  "digital": "digital art style, modern aesthetic, sleek design, perfect lighting, high-tech feel, trending digital art",
  "vintage": "vintage style, retro aesthetic, aged look, film grain, nostalgic atmosphere, classic photography",
  "minimalist": "minimalist style, clean and simple, elegant, refined composition, subtle details, perfect balance",
  "fantasy": "fantasy art style, magical and ethereal, mystical atmosphere, enchanted scenery, epic fantasy art",
  "comic": "comic book style, bold colors and lines, dynamic composition, cel shading, manga influence",
  "cinematic": "cinematic style, dramatic lighting and composition, movie-like quality, epic scene, professional cinematography"
};

// Negative prompts to improve image quality
const globalNegativePrompt = "blur, haze, deformed, disfigured, bad anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, out of focus, bad quality, watermark, signature, text";

// Helper function to process and enhance the prompt
const processPrompt = (prompt: string, style: string = "realistic") => {
  try {
    // Clean and validate the prompt
    let processedPrompt = prompt.trim();
    if (!processedPrompt) {
      throw new Error("Empty prompt provided");
    }

    // Get style enhancement
    const styleEnhancement = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.realistic;
    
    // Add composition and lighting improvements
    const compositionBoost = "perfect composition, professional lighting, golden ratio";
    
    // Add technical quality improvements
    const qualityBoost = "best quality, highly detailed, sharp focus, 8K UHD, high resolution";
    
    // Combine all enhancements
    processedPrompt = `${processedPrompt}, ${styleEnhancement}, ${compositionBoost}, ${qualityBoost}. 
    Negative prompt: ${globalNegativePrompt}`;

    return processedPrompt;
  } catch (error) {
    console.error("Error processing prompt:", error);
    throw error;
  }
};

// Helper function to generate cache key
const generateCacheKey = (prompt: string, style: string, resolution: string) => {
  return `image:${prompt}:${style}:${resolution}`.toLowerCase();
};

// Retry mechanism for API calls
const retryWithExponentialBackoff = async (
  fn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      if (error?.response?.status === 429) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized. Please sign in." }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API Key is not configured");
      return new NextResponse(
        JSON.stringify({ error: "OpenAI API Key not configured" }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const body = await req.json();
    const { prompt, amount = "1", resolution = "1024x1024", style = "realistic" } = body;

    if (!prompt) {
      return new NextResponse(
        JSON.stringify({ error: "Image prompt is required" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Free trial has expired. Please upgrade to pro.",
          code: "FREE_TRIAL_EXPIRED"
        }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    const imageCount = parseInt(amount, 10);
    if (isNaN(imageCount) || imageCount < 1 || imageCount > 1) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid amount. Must be 1 for DALL-E 3" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate resolution
    const validResolutions = ["1024x1024", "1792x1024", "1024x1792"];
    if (!validResolutions.includes(resolution)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid resolution for DALL-E 3. Must be 1024x1024, 1792x1024, or 1024x1792" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first
    const cacheKey = generateCacheKey(prompt, style, resolution);
    const cachedResult = await redis.get(cacheKey);
    
    if (cachedResult) {
      console.log("Cache hit for image generation");
      return NextResponse.json(cachedResult);
    }

    // Process the prompt with style enhancement
    const enhancedPrompt = processPrompt(prompt, style);
    console.log("Enhanced prompt:", enhancedPrompt);

    try {
      const response = await retryWithExponentialBackoff(async () => {
        return await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1, // DALL-E 3 only supports n=1
          size: resolution as "1024x1024" | "1792x1024" | "1024x1792",
          quality: "hd", // Using HD quality for better results
          style: "vivid", // Using vivid style for more striking images
          response_format: "url",
        });
      });

      if (!isPro) {
        await increaseApiLimit();
      }

      // Cache the result for 24 hours
      await redis.set(cacheKey, response.data, { ex: 86400 });

      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error("OpenAI API Error:", error.response?.data || error.message);
      throw error;
    }

  } catch (error: any) {
    console.error("[IMAGE_ERROR]", error);
    
    // Handle OpenAI API specific errors
    if (error?.response?.data?.error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.response.data.error.message,
          code: "OPENAI_ERROR"
        }), 
        { status: error.response.status || 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle rate limiting
    if (error?.response?.status === 429) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT"
        }), 
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        error: "An error occurred while generating images",
        details: error?.message || "Unknown error"
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
