import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversations = await prismadb.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[CONVERSATION_HISTORY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
