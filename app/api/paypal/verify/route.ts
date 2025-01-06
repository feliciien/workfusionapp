import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { verifySubscription } from "@/lib/paypal";
import { createNeonClient } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const db = createNeonClient();

    const subscription = await db.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" }
    });

    if (!subscription?.paypalSubscriptionId) {
      return NextResponse.json({ isSubscribed: false });
    }

    const { isValid } = await verifySubscription(subscription.paypalSubscriptionId);

    if (!isValid) {
      // Update subscription status to cancelled
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELLED" }
      });
    }

    return NextResponse.json({ isSubscribed: isValid });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Route segment config
export const dynamic = 'force-dynamic';
