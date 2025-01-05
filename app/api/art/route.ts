import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

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
  
  // Add character-specific enhancements if detected
  if (processedPrompt.toLowerCase().includes("samurai") || 
      processedPrompt.toLowerCase().includes("warrior")) {
    processedPrompt += ", full body shot, detailed armor, dramatic lighting, powerful pose";
  }
  
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

    const isPro = await checkSubscription(userId);

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
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

    // Process and enhance the prompt
    const enhancedPrompt = processPrompt(prompt, style);

    const freeTrial = await checkApiLimit(userId);
    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
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
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "ugly, blurry, poor quality, distorted",
            num_inference_steps: 50,
          },
        }),
      }
    );

    if (!response.ok) {
      return new NextResponse("Art generation failed", { status: 500 });
    }

    const prediction = await response.json();
    if (!isPro) {
      await increaseApiLimit(userId);
    }
    return NextResponse.json(prediction);
  } catch (error) {
    console.log("[ART_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
