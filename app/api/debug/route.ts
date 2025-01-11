export const dynamic = "force-dynamic";

import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const user = session?.user;

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get subscription info
    const subscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId,
      }
    });

    // Get all subscriptions for comparison
    const allSubscriptions = await prismadb.userSubscription.findMany();

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
