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

// Verify Redis connection
const verifyRedisConnection = async () => {
  try {
    // Try to set and get a test value
    const testKey = 'test-connection';
    await redis.set(testKey, 'test-value');
    const testValue = await redis.get(testKey);
    await redis.del(testKey);
    return testValue === 'test-value';
  } catch (error: any) {
    console.error('[REDIS_CONNECTION_ERROR]:', {
      error: error?.message || 'Unknown error',
      stack: error?.stack || '',
      url: !!process.env.UPSTASH_REDIS_REST_URL,
      token: !!process.env.UPSTASH_REDIS_REST_TOKEN
    });
    return false;
  }
};

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
  maxRetries: number = 2,
  baseDelay: number = 1000
) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout

      try {
        const result = await Promise.race([
          fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 50000)
          )
        ]);
        
        clearTimeout(timeoutId);
        return result;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError' || error.message === 'Operation timed out') {
          throw new Error('Request timed out after 50 seconds');
        }
        throw error;
      }
    } catch (error: any) {
      lastError = error;
      
      if (i === maxRetries - 1) break;
      
      if (error?.response?.status === 429 || error.message.includes('timeout')) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

export async function POST(req: Request) {
  try {
    // Send initial response headers to keep connection alive
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
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

    // Verify Redis connection early
    const redisConnected = await verifyRedisConnection();
    if (!redisConnected) {
      console.warn('[REDIS_WARNING] Redis connection failed, proceeding without caching');
    }

    // Check cache first (only if Redis is connected)
    let cachedResult = null;
    const cacheKey = generateCacheKey(prompt, style, resolution);
    
    if (redisConnected) {
      try {
        cachedResult = await redis.get(cacheKey);
      } catch (error: any) {
        console.error('[REDIS_CACHE_ERROR]:', error?.message || 'Unknown error');
        // Continue without cache on error
      }
    }
    
    if (cachedResult) {
      console.log("Cache hit for image generation");
      return NextResponse.json(cachedResult);
    }

    // Process the prompt with style enhancement
    const enhancedPrompt = processPrompt(prompt, style);
    console.log("[DEBUG] Image generation request:", {
      prompt: enhancedPrompt.slice(0, 100) + "...", // Log first 100 chars of prompt
      resolution,
      style,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await retryWithExponentialBackoff(async () => {
        // Log the exact request configuration
        console.log("[DEBUG] OpenAI Request Config:", {
          timestamp: new Date().toISOString(),
          model: "dall-e-3",
          promptLength: enhancedPrompt.length,
          resolution,
          apiKeyPresent: !!process.env.OPENAI_API_KEY,
          apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
          apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 5) || 'none'
        });

        try {
          const result = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: resolution as "1024x1024" | "1792x1024" | "1024x1792",
            quality: "hd",
            style: "vivid",
            response_format: "url",
          });

          // Log successful response
          console.log("[DEBUG] OpenAI Success Response:", {
            timestamp: new Date().toISOString(),
            hasData: !!result.data,
            dataLength: result.data?.length || 0,
            firstUrl: result.data?.[0]?.url ? 'present' : 'missing'
          });

          return result;
        } catch (apiError: any) {
          // Log detailed API error
          console.error("[DEBUG] OpenAI API Error:", {
            timestamp: new Date().toISOString(),
            errorMessage: apiError?.message,
            errorType: apiError?.type,
            errorCode: apiError?.status,
            responseData: apiError?.response?.data,
            headers: apiError?.response?.headers
          });
          throw apiError; // Re-throw to be handled by outer catch
        }
      }, 3, 2000); // 3 retries, 2 second base delay

      if (!isPro) {
        await increaseApiLimit();
      }

      // Cache the result for 24 hours (only if Redis is connected)
      if (redisConnected) {
        try {
          await redis.set(cacheKey, response.data, { ex: 86400 });
        } catch (error: any) {
          console.error('[REDIS_CACHE_SET_ERROR]:', error?.message || 'Unknown error');
          // Continue without caching on error
        }
      }

      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error("[IMAGE_ERROR] Detailed error:", {
        timestamp: new Date().toISOString(),
        errorType: error?.constructor?.name,
        message: error?.message || 'Unknown error',
        response: {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
        },
        request: {
          prompt: enhancedPrompt.slice(0, 50) + '...',
          resolution,
          style
        }
      });

      // Handle specific error cases
      if (!process.env.OPENAI_API_KEY) {
        return new NextResponse(
          JSON.stringify({ 
            error: "OpenAI API key is not configured",
            code: "MISSING_API_KEY"
          }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (error?.response?.status === 401) {
        return new NextResponse(
          JSON.stringify({ 
            error: "OpenAI API key is invalid or expired",
            code: "INVALID_API_KEY",
            details: "Please check your API key configuration"
          }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (error?.response?.status === 429) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            code: "RATE_LIMIT",
            details: "You've reached the OpenAI API rate limit"
          }), 
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (error?.message?.includes('timeout') || error?.code === 'ETIMEDOUT') {
        return new NextResponse(
          JSON.stringify({ 
            error: "Request timed out",
            code: "TIMEOUT",
            details: "The request took too long to complete"
          }), 
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Handle OpenAI specific errors
      if (error?.response?.data?.error) {
        return new NextResponse(
          JSON.stringify({ 
            error: error.response.data.error.message,
            code: "OPENAI_ERROR",
            details: error.response.data.error
          }), 
          { status: error.response.status || 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Generic error response
      return new NextResponse(
        JSON.stringify({ 
          error: "An error occurred during image generation",
          code: "INTERNAL_ERROR",
          message: error?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error("[IMAGE_ERROR] Full error:", {
      message: error?.message || 'Unknown error',
      response: error?.response?.data,
      stack: error?.stack || '',
      redisUrl: !!process.env.UPSTASH_REDIS_REST_URL, // Log if Redis URL exists
      openAiKey: !!process.env.OPENAI_API_KEY, // Log if OpenAI key exists
    });
    
    // Handle OpenAI API specific errors
    if (error?.response?.data?.error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.response.data.error.message,
          code: "OPENAI_ERROR",
          details: error.response.data.error
        }), 
        { status: error.response.status || 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generic error response
    return new NextResponse(
      JSON.stringify({ 
        error: "An error occurred during image generation",
        code: "INTERNAL_ERROR",
        message: error?.message || 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
