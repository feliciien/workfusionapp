import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { trackEvent } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { FEATURE_TYPES } from "@/constants";

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const maxDuration = 60; // Maximum allowed duration for hobby plan

interface ConversationMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, conversationId, featureType = "conversation" } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.CONTENT_WRITER),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        JSON.stringify({ error: "Free usage limit reached. Please upgrade to pro for unlimited access." }),
        { 
          status: 403,
          headers: { 
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const response = await openai.chat.completions.create({
      model: "o1-preview",
      messages,
      stream: false,
    });

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.CONTENT_WRITER);
    }

    // Track the event
    await trackEvent(userId, featureType, {
      messageCount: messages.length,
      model: "o1-preview",
      status: "success"
    });

    // Store conversation in database
    const messageContent = response.choices[0].message?.content || "";
    if (conversationId) {
      try {
        await prisma.conversation.update({
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
        await prisma.conversation.create({
          data: {
            userId,
            title: "New Conversation",
            messages: {
              create: [
                ...messages.map((msg: ConversationMessage) => ({
                  content: msg.content,
                  role: msg.role,
                  timestamp: new Date(),
                })),
                {
                  content: messageContent,
                  role: "assistant",
                }
              ]
            },
          }
        });
      } catch (dbError) {
        console.error("[DB_ERROR]", dbError);
        // Continue even if DB save fails
      }
    }

    return NextResponse.json({
      id: Date.now().toString(),
      content: messageContent,
      timestamp: new Date(),
      status: 'sent',
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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const conversationId = url.searchParams.get("id");

    if (!conversationId) {
      return new NextResponse("Conversation ID required", { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
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
