import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, resource } = body;

    // Extract the subscription ID from the resource
    const subscriptionId = resource.id;
    const status = resource.status?.toUpperCase();
    const customerId = resource.subscriber?.payer_id;
    const planId = resource.plan_id;

    if (!subscriptionId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Find the subscription in our database
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
    });

    if (!existingSubscription) {
      console.log(`No subscription found for PayPal subscription ID: ${subscriptionId}`);
      return new NextResponse("Subscription not found", { status: 404 });
    }

    switch (event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await prisma.subscription.update({
          where: {
            paypalSubscriptionId: subscriptionId,
          },
          data: {
            status: "active",
            planId: planId,
            currentPeriodEnd: new Date(resource.billing_info.next_billing_time),
          },
        });
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await prisma.subscription.update({
          where: {
            paypalSubscriptionId: subscriptionId,
          },
          data: {
            status: "canceled",
            currentPeriodEnd: null,
          },
        });
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await prisma.subscription.update({
          where: {
            paypalSubscriptionId: subscriptionId,
          },
          data: {
            status: "suspended",
          },
        });
        break;

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await prisma.subscription.update({
          where: {
            paypalSubscriptionId: subscriptionId,
          },
          data: {
            status: "past_due",
          },
        });
        break;

      case "BILLING.SUBSCRIPTION.RENEWED":
        await prisma.subscription.update({
          where: {
            paypalSubscriptionId: subscriptionId,
          },
          data: {
            status: "active",
            currentPeriodEnd: new Date(resource.billing_info.next_billing_time),
          },
        });
        break;

      default:
        console.log(`Unhandled event type: ${event_type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[PAYPAL_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Route segment config
export const dynamic = 'force-dynamic';