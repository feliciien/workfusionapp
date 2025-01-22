import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const user = session?.user;

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get subscription info
    const subscription = await prisma.userSubscription.findUnique({
      where: {
        userId: userId,
      }
    });

    // Get all subscriptions for comparison
    const allSubscriptions = await prisma.userSubscription.findMany();

    return NextResponse.json({
      userId: userId,
      userEmail: user.email,
      subscription: subscription,
      allSubscriptions: allSubscriptions,
      now: new Date(),
    });
  } catch (error) {
    console.error("[DEBUG_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
