import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/api-limit";
import { trackEvent } from "@/lib/analytics";
import prismadb from "@/lib/prismadb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, conversationId, featureType = "conversation" } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    console.log("[CONVERSATION] Processing request for user:", userId);

    try {
      // Try to create user if they don't exist
      await prismadb.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId }
      });
    } catch (error) {
      console.error("[USER_CREATE_ERROR]", error);
      return new NextResponse("Failed to create user", { status: 500 });
    }

    if (!openai.apiKey) {
      console.error("[OPENAI_ERROR] API key not configured");
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    // Validate API key format
    if (!openai.apiKey.startsWith('sk-')) {
      console.error("[OPENAI_ERROR] Invalid API key format");
      return new NextResponse("Invalid OpenAI API key format", { status: 500 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Track API call attempt
    await trackEvent(userId, "api_call", {
      endpoint: "/api/conversation",
      messageCount: messages.length,
      status: "attempt"
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });

    const assistantMessage = response.choices[0].message;

    // Store conversation and messages in database
    let conversation;
    try {
      if (conversationId) {
        console.log("[CONVERSATION] Updating existing conversation:", conversationId);
        // Update existing conversation
        conversation = await prismadb.conversation.update({
          where: {
            id: conversationId,
            userId: userId,
          },
          data: {
            updatedAt: new Date(),
            messages: {
              create: [
                {
                  content: messages[messages.length - 1].content,
                  role: 'user',
                },
                {
                  content: assistantMessage.content,
                  role: 'assistant',
                }
              ]
            }
          },
        });
      } else {
        console.log("[CONVERSATION] Creating new conversation for user:", userId);
        // Create new conversation
        conversation = await prismadb.conversation.create({
          data: {
            userId: userId,
            title: messages[0].content.slice(0, 100),
            messages: {
              create: [
                {
                  content: messages[messages.length - 1].content,
                  role: 'user',
                },
                {
                  content: assistantMessage.content,
                  role: 'assistant',
                }
              ]
            }
          },
        });
      }
      console.log("[CONVERSATION] Successfully saved conversation");
    } catch (error) {
      console.error("[CONVERSATION_DB_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        userId,
        conversationId,
        stack: error instanceof Error ? error.stack : undefined
      });
      return new NextResponse("Failed to save conversation", { status: 500 });
    }

    if (!isPro) {
      await increaseApiLimit();
    }

    // Track successful API call
    await trackEvent(userId, "api_call", {
      endpoint: "/api/conversation",
      status: "success",
      tokens: response.usage?.total_tokens,
      messageCount: messages.length
    });

    return NextResponse.json(assistantMessage);
  } catch (error) {
    const { userId } = await auth();
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

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const conversationId = url.searchParams.get("id");

    if (!conversationId) {
      return new NextResponse("Conversation ID required", { status: 400 });
    }

    const conversation = await prismadb.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("[CONVERSATION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
