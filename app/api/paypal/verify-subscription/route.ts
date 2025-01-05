import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { paypalApi } from "@/lib/paypal";
import { db } from "@/lib/db";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        paypalSubscriptionId: subscriptionId
      }
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    const result = await paypalApi.verifySubscription(subscriptionId);

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
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[VERIFY_SUBSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
