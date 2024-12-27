import { auth } from "@clerk/nextjs";
import { NextResponse } from 'next/server';
import { checkSubscription } from "@/lib/subscription";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/musicgen-small";
const MAX_RETRIES = 3;          // Number of times to retry if model is busy
const RETRY_DELAY = 10000;      // Wait 10 seconds between retries
const REQUEST_TIMEOUT = 90000;  // Abort request if it takes longer than 90s
export const maxDuration = 60; // Maximum allowed duration for hobby plan

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface HuggingFaceError {
  error: string;
  name?: string;
  [key: string]: any;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    console.log("[MUSIC_API] Checking access for user:", userId);

    if (!userId) {
      console.log("[MUSIC_API] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription();
    console.log("[MUSIC_API] Pro status:", { userId, isPro });

    if (!isPro) {
      const hasApiLimit = await checkApiLimit();
      console.log("[MUSIC_API] API limit check:", { userId, hasApiLimit });
      
      if (!hasApiLimit) {
        return new NextResponse("Free tier limit reached", { status: 403 });
      }
    }

    const { prompt } = await req.json();
    console.log("[MUSIC_API] Received prompt:", prompt);

    if (!process.env.HUGGINGFACE_TOKEN) {
      throw new Error("HUGGINGFACE_TOKEN not set in .env.local");
    }

    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(HUGGINGFACE_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
            }
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64Audio = bufferToBase64(arrayBuffer);

          // Only increase the API limit count for free users
          if (!isPro) {
            await increaseApiLimit();
          }

          return new NextResponse(JSON.stringify({ audio: base64Audio }));
        }

        if (response.status === 503) {
          console.log(`[MUSIC_API] Model is busy, attempt ${attempt}/${MAX_RETRIES}`);
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error("[MUSIC_API] Request timed out");
            throw new Error("Request timed out");
          }
          throw error;
        }
        
        // If it's not an Error instance, create a new Error
        throw new Error(error instanceof Object ? JSON.stringify(error) : 'An unknown error occurred');
      }
    }

    throw new Error("Failed to generate music after multiple retries");
  } catch (error: unknown) {
    console.error("[MUSIC_API_ERROR]", error instanceof Error ? error.message : error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}