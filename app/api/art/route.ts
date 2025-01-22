import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";
import axios from "axios";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const isPro = await checkSubscription();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const body = await req.json();
    const { prompt, amount = 1, size = "1024x1024" } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Validate prompt length
    if (prompt.length < 3) {
      return new NextResponse("Prompt too short. Please provide more details.", { status: 400 });
    }

    if (prompt.length > 1000) {
      return new NextResponse("Prompt too long. Maximum length is 1000 characters.", { status: 400 });
    }

    try {
      // Call OpenAI API directly using axios
      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt,
          n: Number(amount),
          size,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      console.log("[ART_RESPONSE]", response.data);

      const imageUrls = response.data.data.map((image: { url: string }) => image.url);

      return NextResponse.json({
        data: imageUrls,
      });
    } catch (apiError: any) {
      console.error("[API_ERROR]", apiError.response?.data || apiError.message);
      return new NextResponse("Failed to generate images", { status: 500 });
    }
  } catch (error: any) {
    console.error("[ART_ERROR]", error);

    // Handle specific OpenAI API errors
    if (error.response && error.response.status) {
      const errorMessage = error.response.data?.error?.message || "OpenAI API Error";
      return new NextResponse(errorMessage, { status: error.response.status });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
