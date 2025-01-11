import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const runtime = 'nodejs';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await prismadb.conversation.findUnique({
      where: {
        id: context.params.id,
        userId: userId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          select: {
            content: true,
            role: true,
            createdAt: true
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
