import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const subscriptionId = searchParams.get("subscriptionId");

    if (!userId || !subscriptionId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        paypalSubscriptionId: subscriptionId,
      },
      select: {
        paypalSubscriptionId: true,
        paypalCurrentPeriodEnd: true,
        paypalStatus: true,
      },
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    const isValid = subscription.paypalStatus === "ACTIVE" && 
      subscription.paypalCurrentPeriodEnd?.getTime()! + 24 * 60 * 60 * 1000 > Date.now();

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error("[VERIFY_SUBSCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
