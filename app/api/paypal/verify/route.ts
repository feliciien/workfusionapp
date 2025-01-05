import { getSessionFromRequest } from "@/lib/jwt";
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

    const subscription = await prisma.subscription.findFirst({
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
      await prisma.subscription.update({
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
    console.error("[VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    await pool.end();
  }
}

// Route segment config
export const dynamic = 'force-dynamic';
