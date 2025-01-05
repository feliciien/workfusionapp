import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { db } from "@/lib/db";
import { paypalApi } from "@/lib/paypal";

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: {
        userId: userId
      }
    });

    if (!subscription) {
      return new NextResponse("No subscription found", { status: 404 });
    }

    // If we have a PayPal subscription ID, verify it with PayPal
    if (subscription.paypalSubscriptionId) {
      const result = await paypalApi.verifySubscription(subscription.paypalSubscriptionId);

      if (!result.isValid) {
        // Update subscription status in database
        await db.subscription.update({
          where: {
            id: subscription.id
          },
          data: {
            status: "EXPIRED"
          }
        });

        return NextResponse.json({
          ...subscription,
          status: "EXPIRED",
          isValid: false
        });
      }
    }

    return NextResponse.json({
      ...subscription,
      isValid: subscription.status === "ACTIVE"
    });
  } catch (error) {
    console.error("[GET_SUBSCRIPTION_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}