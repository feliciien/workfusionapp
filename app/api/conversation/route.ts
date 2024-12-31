import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import prismadb from "@/lib/prismadb";
import { trackEvent } from "@/lib/analytics";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
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

    // Generate a title if this is a new conversation
    let conversationTitle = "New Conversation";
    if (!conversationId && messages.length > 0) {
      try {
        const titleCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Generate a short, concise title (max 6 words) for this conversation based on the user's first message. Just return the title, nothing else."
            },
            {
              role: "user",
              content: messages[0].content
            }
          ],
          temperature: 0.7,
          max_tokens: 20,
        });
        
        conversationTitle = titleCompletion.choices[0].message.content?.trim() || "New Conversation";
      } catch (error) {
        console.error("[TITLE_GENERATION_ERROR]", error);
        // Fall back to using the first few words of the user's message
        conversationTitle = messages[0].content.slice(0, 40) + "...";
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
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

    let savedConversation;

    // Store conversation in database
    const messageContent = completion.choices[0].message.content || "";
    if (conversationId) {
      try {
        savedConversation = await prismadb.conversation.update({
          where: {
            id: conversationId,
            userId: userId,
          },
          data: {
            messages: {
              create: {
                content: messageContent,
                role: "assistant",
              },
            },
          },
          include: {
            messages: true,
          },
        });
      } catch (dbError) {
        console.error("[DB_ERROR]", dbError);
        // Continue even if DB save fails
      }
    } else {
      try {
        // Create new conversation with generated title
        savedConversation = await prismadb.conversation.create({
          data: {
            userId,
            title: conversationTitle,
            messages: {
              create: messages.map((msg: any) => ({
                content: msg.content,
                role: msg.role,
              })).concat([{
                content: messageContent,
                role: "assistant",
              }])
            },
          },
          include: {
            messages: true,
          },
        });
      } catch (dbError) {
        console.error("[DB_ERROR]", dbError);
        // Continue even if DB save fails
      }
    }

    return NextResponse.json({
      content: messageContent,
      conversationId: savedConversation?.id,
      title: savedConversation?.title || conversationTitle,
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
