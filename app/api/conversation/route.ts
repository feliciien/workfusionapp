import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { trackEvent } from "@/lib/analytics";
import { FEATURE_TYPES } from "@/constants";

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const { messages, conversationId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkFeatureLimit(FEATURE_TYPES.CONTENT_WRITER);
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { 
        status: 403,
        headers: {
          'X-Show-Upgrade': 'true'
        }
      });
    }

    let conversation;
    if (conversationId) {
      conversation = await db.conversation.update({
        where: {
          id: conversationId,
          userId
        },
        data: {
          messages
        }
      });
    } else {
      conversation = await db.conversation.create({
        data: {
          userId,
          title: messages[0]?.content?.substring(0, 100) || "New Conversation",
          messages
        }
      });
    }

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.CONTENT_WRITER);
    }

    await trackEvent(userId, "conversation_created", {
      conversationId: conversation.id,
      messageCount: messages.length
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
