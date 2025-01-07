import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Remove edge runtime for now since we're using Prisma
// export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscription = await prismadb.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("[SUBSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
