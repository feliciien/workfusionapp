import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { paypalApi } from "@/lib/paypal";

const connectionString = process.env.POSTGRES_PRISMA_URL!;
const pool = new Pool({ connectionString });
const client = pool;

const prisma = new PrismaClient({
  adapter: new PrismaNeon(client)
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resource_type, event_type, resource } = body;

    if (resource_type !== "subscription" || !resource) {
      return new NextResponse("Invalid webhook event", { status: 400 });
    }

    const subscriptionId = resource.id;
    if (!subscriptionId) {
      return new NextResponse("Subscription ID not found", { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        paypalSubscriptionId: subscriptionId
      }
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    let status = subscription.status;
    let currentPeriodEnd = subscription.currentPeriodEnd;

    switch (event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        status = "active";
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        status = "canceled";
        break;
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        status = "suspended";
        break;
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        status = "past_due";
        break;
      case "BILLING.SUBSCRIPTION.RENEWED":
        status = "active";
        // Update the subscription period end date
        if (resource.billing_info?.next_billing_time) {
          currentPeriodEnd = new Date(resource.billing_info.next_billing_time);
        }
        break;
      default:
        // Ignore other event types
        return new NextResponse("OK", { status: 200 });
    }

    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        status,
        currentPeriodEnd
      }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    await pool.end();
  }
}

// Route segment config
export const dynamic = 'force-dynamic';