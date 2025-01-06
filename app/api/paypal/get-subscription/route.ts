import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { createNeonClient } from "@/lib/db";
import { verifySubscription } from "@/lib/paypal";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const db = createNeonClient();

    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!subscription?.paypalSubscriptionId) {
      return NextResponse.json({ isSubscribed: false });
    }

    const { isValid, status } = await verifySubscription(subscription.paypalSubscriptionId);

    if (!isValid) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELLED" }
      });
      return NextResponse.json({ isSubscribed: false });
    }

    return NextResponse.json({
      isSubscribed: true,
      status,
      subscriptionId: subscription.paypalSubscriptionId
    });
  } catch (error) {
    console.error("[GET_SUBSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}