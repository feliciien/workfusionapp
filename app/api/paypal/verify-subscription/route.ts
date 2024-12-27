import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismaEdge } from "@/lib/prisma-edge";
import { verifySubscription } from "@/lib/paypal";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // Verify subscription with PayPal
    const { isValid, status, planId, nextBillingTime } = await verifySubscription(subscriptionId);

    if (!isValid) {
      return new NextResponse("Invalid subscription", { status: 400 });
    }

    // Update subscription in database
    const subscription = await prismaEdge.userSubscription.upsert({
      where: {
        userId,
      },
      update: {
        paypalSubscriptionId: subscriptionId,
        paypalStatus: status,
        paypalPlanId: planId,
        paypalCurrentPeriodEnd: nextBillingTime ? new Date(nextBillingTime) : null,
      },
      create: {
        userId,
        paypalSubscriptionId: subscriptionId,
        paypalStatus: status,
        paypalPlanId: planId,
        paypalCurrentPeriodEnd: nextBillingTime ? new Date(nextBillingTime) : null,
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("[PAYPAL_VERIFY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
