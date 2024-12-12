import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/api-limit";
import { trackEvent } from "@/lib/analytics";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  const { userId } = auth();

  try {
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.apiKey) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    // Track API call attempt
    await trackEvent(userId, "api_call", {
      endpoint: "/api/conversation",
      messageCount: messages.length,
      status: "attempt"
    });

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    // Track successful API call
    await trackEvent(userId, "api_call", {
      endpoint: "/api/conversation",
      status: "success",
      tokens: response.data.usage?.total_tokens,
      messageCount: messages.length
    });

    return NextResponse.json(response.data.choices[0].message);
  } catch (error) {
    // Track error
    if (userId) {
      await trackEvent(userId, "error", {
        endpoint: "/api/conversation",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }

    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
