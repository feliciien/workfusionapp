import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await prismadb.conversation.findUnique({
      where: {
        id: params.id,
        userId: userId,
      },
      include: {
        messages: {
          select: {
            content: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Format the conversation for download
    const formattedConversation = {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      messages: conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    console.error("[CONVERSATION_DOWNLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
