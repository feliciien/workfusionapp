import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { createNeonClient } from "@/lib/db";
import { verifySubscription } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    const db = createNeonClient();

    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        paypalSubscriptionId: subscriptionId
      }
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    const { isValid, status } = await verifySubscription(subscriptionId);

    if (!isValid) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELLED" }
      });
    } else if (status && status !== subscription.status) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status }
      });
    }

    return NextResponse.json({ isValid, status });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
