import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { trackEvent } from "@/lib/analytics";
import prismadb from "@/lib/prismadb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

interface ConversationMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

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

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse(
        JSON.stringify({ error: "Free trial has expired. Please upgrade to pro." }),
        { 
          status: 403,
          headers: { 
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      stream: false,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    // Track the event
    await trackEvent(userId, featureType, {
      messageCount: messages.length,
      model: "gpt-4",
      status: "success"
    });

    // Store conversation in database
    const messageContent = response.choices[0].message.content || "";
    if (conversationId) {
      try {
        await prismadb.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            messages: {
              create: {
                content: messageContent,
                role: "assistant",
              },
            },
          },
        });
      } catch (dbError) {
        console.error("[DB_ERROR]", dbError);
        // Continue even if DB save fails
      }
    } else {
      try {
        // Create new conversation
        await prismadb.conversation.create({
          data: {
            userId,
            title: "New Conversation",
            messages: {
              create: messages.map((msg: any) => ({
                content: msg.content,
                role: msg.role,
              })).concat([{
                content: messageContent,
                role: "assistant",
              }])
            },
          }
        });
      } catch (dbError) {
        console.error("[DB_ERROR]", dbError);
        // Continue even if DB save fails
      }
    }

    return NextResponse.json({
      content: messageContent,
    });
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authSession = await auth();

    if (!authSession?.userId) {
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
        userId: authSession.userId,
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
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
