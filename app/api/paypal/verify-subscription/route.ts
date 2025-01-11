import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySubscription } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

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
    const subscription = await prisma.userSubscription.upsert({
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
