import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    // Get user's API usage
    const apiLimit = await prisma.userApiLimit.findUnique({
      where: { userId }
    });

    // Get user's feature usage
    const featureUsage = await prisma.userFeatureUsage.findMany({
      where: { userId }
    });

    return NextResponse.json({
      user: {
        id: userId,
        email: session.user.email
      },
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        paypalSubscriptionId: subscription.paypalSubscriptionId
      } : null,
      apiLimit: apiLimit?.count || 0,
      featureUsage: featureUsage.map(usage => ({
        featureType: usage.featureType,
        count: usage.count
      }))
    });
  } catch (error) {
    console.error("[DEBUG_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
