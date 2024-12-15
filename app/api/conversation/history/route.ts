import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch conversations with their latest message
    const conversations = await prismadb.conversation.findMany({
      where: {
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc'
      },
    });

    // Format the conversations for the frontend
    const formattedConversations = conversations.map(conversation => ({
      id: conversation.id,
      title: conversation.title,
      timestamp: conversation.updatedAt,
      preview: conversation.messages[0]?.content || "No messages yet",
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('[CONVERSATION_HISTORY_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
