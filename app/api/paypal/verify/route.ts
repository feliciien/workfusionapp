import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const { userId, subscriptionId, customerId, planId } = payload;

    if (!userId || !subscriptionId || !customerId || !planId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await prisma.userSubscription.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId: userId,
        paypalSubscriptionId: subscriptionId,
        paypalCustomerId: customerId,
        paypalPlanId: planId,
        paypalStatus: "ACTIVE",
      },
      update: {
        paypalSubscriptionId: subscriptionId,
        paypalCustomerId: customerId,
        paypalPlanId: planId,
        paypalStatus: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYPAL_VERIFY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
