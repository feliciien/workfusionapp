import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import axios from "axios";
import { checkSubscription } from "@/lib/subscription";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { FEATURE_TYPES } from "@/constants";

// Style enhancements for different image types
const stylePrompts = {
  realistic:
    "ultra realistic, photorealistic, highly detailed, 8k resolution, professional photography, masterpiece quality",
  artistic:
    "artistic style, creative interpretation, vibrant colors, expressive brushstrokes, masterpiece quality, trending on artstation",
  digital:
    "digital art style, modern aesthetic, sleek design, perfect lighting, high-tech feel, trending digital art",
  vintage:
    "vintage style, retro aesthetic, aged look, film grain, nostalgic atmosphere, classic photography",
  minimalist:
    "minimalist style, clean and simple, elegant, refined composition, subtle details, perfect balance",
  fantasy:
    "fantasy art style, magical and ethereal, mystical atmosphere, enchanted scenery, epic fantasy art",
  comic:
    "comic book style, bold colors and lines, dynamic composition, cel shading, manga influence",
  cinematic:
    "cinematic style, dramatic lighting and composition, movie-like quality, epic scene, professional cinematography",
};

// Negative prompts to improve image quality
const globalNegativePrompt =
  "blur, haze, deformed, disfigured, bad anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, out of focus, bad quality, watermark, signature, text";

// Helper function to process and enhance the prompt
const processPrompt = (prompt: string, style: string = "realistic") => {
  try {
    // Clean and validate the prompt
    let processedPrompt = prompt.trim();
    if (!processedPrompt) {
      throw new Error("Empty prompt provided");
    }

    // Get style enhancement
    const styleEnhancement =
      stylePrompts[style as keyof typeof stylePrompts] ||
      stylePrompts.realistic;

    // Add composition and lighting improvements
    const compositionBoost =
      "perfect composition, professional lighting, golden ratio";

    // Add technical quality improvements
    const qualityBoost =
      "best quality, highly detailed, sharp focus, 8K UHD, high resolution";

    // Combine all enhancements
    processedPrompt = `${processedPrompt}, ${styleEnhancement}, ${compositionBoost}, ${qualityBoost}. 
Negative prompt: ${globalNegativePrompt}`;

    return processedPrompt;
  } catch (error) {
    console.error("Error processing prompt:", error);
    throw error;
  }
};

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const body = await req.json();
    const { prompt, amount = 1, style = "realistic" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Generate enhanced prompt
    const enhancedPrompt = processPrompt(prompt, style);

    const isPro = await checkSubscription();
    const hasAvailableUsage = await checkFeatureLimit(
      FEATURE_TYPES.IMAGE_GENERATION
    );

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    try {
      // Use axios to call OpenAI API directly
      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: enhancedPrompt,
          n: Number(amount),
          size: "1024x1024",
          response_format: "url",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      if (!isPro) {
        await incrementFeatureUsage(FEATURE_TYPES.IMAGE_GENERATION);
      }

      return NextResponse.json(response.data);
    } catch (apiError: any) {
      console.error("[IMAGE_API_ERROR]", apiError.response?.data || apiError.message);
      return new NextResponse("Failed to generate images", { status: 500 });
    }
  } catch (error: any) {
    console.error("[GENERAL_ERROR]:", error);

    // Handle specific OpenAI API errors
    if (error.response && error.response.status) {
      const errorMessage =
        error.response.data?.error?.message || "OpenAI API Error";
      return new NextResponse(errorMessage, { status: error.response.status });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
