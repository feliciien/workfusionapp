import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { trackEvent, AnalyticsEventType } from "@/lib/analytics";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationResponse {
  id: string;
  message: {
    role: 'assistant';
    content: string;
  };
}

export async function POST(req: Request) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      console.log("[CONVERSATION_CREATE] Unauthorized request");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, conversationId }: { messages: Message[], conversationId?: string } = body;

    // Validate request body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("[CONVERSATION_CREATE] Invalid messages format:", { body });
      return new NextResponse("Messages are required and must be an array", { status: 400 });
    }

    // Validate message format
    const invalidMessages = messages.filter(
      (msg: Message) => !msg.content || !msg.role || typeof msg.content !== 'string'
    );
    if (invalidMessages.length > 0) {
      console.log("[CONVERSATION_CREATE] Invalid message format:", { invalidMessages });
      return new NextResponse("Invalid message format", { status: 400 });
    }

    // Check subscription and API limit
    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription(userId);

    if (!freeTrial && !isPro) {
      console.log("[CONVERSATION_CREATE] Free trial has expired. Please upgrade to pro.");
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Generate AI response
    console.log("[CONVERSATION_CREATE] Generating AI response");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Failed to generate AI response");
    }

    // Add AI response to messages
    const updatedMessages = [
      ...messages,
      { role: 'assistant' as const, content: responseContent }
    ];

    let conversation: ConversationResponse;
    try {
      if (conversationId) {
        // Update existing conversation
        const result = await db.$transaction(async (tx) => {
          // Verify conversation exists and belongs to user
          const existing = await tx.conversation.findUnique({
            where: { id: conversationId, userId }
          });

          if (!existing) {
            throw new Error('Conversation not found or unauthorized');
          }

          await tx.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
          });

          // Create new message
          await tx.message.create({
            data: {
              conversationId,
              content: responseContent,
              role: 'assistant'
            }
          });

          const response: ConversationResponse = {
            id: conversationId,
            message: {
              role: 'assistant',
              content: responseContent
            }
          };

          return response;
        });
        conversation = result;
      } else {
        // Create new conversation
        const result = await db.$transaction(async (tx) => {
          const newConversation = await tx.conversation.create({
            data: {
              userId,
              title: messages[0]?.content?.substring(0, 100) || "New Conversation",
              preview: messages[0]?.content?.substring(0, 100) || "No preview available"
            }
          });

          // Create initial messages
          await tx.message.createMany({
            data: messages.map((message: Message) => ({
              conversationId: newConversation.id,
              content: message.content,
              role: message.role
            }))
          });

          // Create AI response message
          await tx.message.create({
            data: {
              conversationId: newConversation.id,
              content: responseContent,
              role: 'assistant'
            }
          });

          const response: ConversationResponse = {
            id: newConversation.id,
            message: {
              role: 'assistant',
              content: responseContent
            }
          };

          return response;
        });
        conversation = result;
      }
    } catch (error) {
      console.error("[CONVERSATION_CREATE] Database error:", {
        error,
        conversationId,
        userId
      });
      return new NextResponse("Failed to save conversation", { status: 500 });
    }

    if (!conversation) {
      console.error("[CONVERSATION_CREATE] Failed to create/update conversation:", {
        conversationId,
        userId
      });
      return new NextResponse("Failed to process conversation", { status: 500 });
    }

    // Increase API limit if not pro
    if (!isPro) {
      await increaseApiLimit(userId);
    }

    // Track analytics
    const eventType: AnalyticsEventType = "conversation_created";
    await trackEvent(userId, eventType, {
      conversationId: conversation.id,
      messageCount: updatedMessages.length,
      duration: Date.now() - start
    });

    console.log("[CONVERSATION_CREATE] Success:", {
      conversationId: conversation.id,
      messageCount: updatedMessages.length,
      duration: Date.now() - start
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("[CONVERSATION_CREATE] Unexpected error:", {
      error,
      duration: Date.now() - start
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
