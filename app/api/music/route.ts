import { NextResponse } from 'next/server';

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/musicgen-small";
const MAX_RETRIES = 3;          // Number of times to retry if model is busy
const RETRY_DELAY = 10000;      // Wait 10 seconds between retries
const REQUEST_TIMEOUT = 90000;  // Abort request if it takes longer than 90s

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("Received prompt:", prompt);

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
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          },
          body: JSON.stringify({ inputs: prompt }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            const data = await response.json();
            const audioBase64 = data[0]?.blob;
            if (!audioBase64) {
              console.error("No audio data returned from model.");
              return NextResponse.json({ error: "No audio returned from the model." }, { status: 500 });
            }

            const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;
            return NextResponse.json({ audio: audioDataUrl });
          } else {
            // Binary response
            const arrayBuffer = await response.arrayBuffer();
            const base64 = bufferToBase64(arrayBuffer);
            // Assuming FLAC, adjust MIME if needed
            const audioDataUrl = `data:audio/flac;base64,${base64}`;
            return NextResponse.json({ audio: audioDataUrl });
          }

        } else {
          const contentType = response.headers.get("content-type") || "";
          let errorData: any = {};
          if (contentType.includes("application/json")) {
            errorData = await response.json().catch(() => ({}));
          } else {
            console.error("Non-JSON error response");
          }

          console.error("Hugging Face API error:", errorData);

          if (errorData.error && errorData.error.includes("Model too busy")) {
            console.log(`Model busy, attempt ${attempt} of ${MAX_RETRIES}. Retrying in ${RETRY_DELAY / 1000} seconds...`);
            if (attempt < MAX_RETRIES) {
              await new Promise(res => setTimeout(res, RETRY_DELAY));
              continue;
            } else {
              return NextResponse.json({ error: "Model is too busy. Please try again later." }, { status: 503 });
            }
          } else {
            return NextResponse.json({ error: "Failed to generate music." }, { status: 500 });
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          console.error("Request timed out.");
          return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 504 });
        } else {
          console.error("Error during request:", error);
          return NextResponse.json({ error: "Error generating music." }, { status: 500 });
        }
      }
    }
  } catch (error) {
    console.error("Music generation error:", error);
    return NextResponse.json({ error: "Error generating music." }, { status: 500 });
  }
}