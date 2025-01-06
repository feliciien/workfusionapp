import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new NextResponse("File is required", { status: 400 });
    }

    const isPro = await checkSubscription(userId);
    const freeTrial = await checkApiLimit(userId);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Simulated document analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulated response
    const response = {
      summary: "This document discusses the importance of artificial intelligence in modern business applications. It highlights key trends in machine learning and data analytics, while emphasizing the need for ethical considerations in AI development.",
      keyPoints: [
        "AI adoption is growing across industries",
        "Machine learning models are becoming more sophisticated",
        "Data privacy remains a crucial concern",
        "Ethical AI development is essential",
        "Business transformation through AI integration"
      ],
      sentiment: "positive",
      wordCount: 2547,
      readingTime: 12
    };

    // Increment the API limit
    if (!isPro) {
      await increaseApiLimit(userId);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.log("[DOCUMENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
