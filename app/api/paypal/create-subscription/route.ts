import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prismadb";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 });
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        paypalSubscriptionId: planId,
        planId: planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("[PAYPAL_CREATE_SUBSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}