import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismaEdge } from "@/lib/prisma-edge";

export const runtime = "edge";

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    console.log("[SUBSCRIPTION_API] Check started:", {
      userId,
      userExists: !!user,
      timestamp: new Date().toISOString()
    });

    if (!userId || !user) {
      console.log("[SUBSCRIPTION_API] Unauthorized - no user");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismaEdge.userSubscription.findUnique({
      where: {
        userId: userId
      }
    });

    console.log("[SUBSCRIPTION_API] Subscription found:", {
      userId,
      subscriptionExists: !!userSubscription,
      status: userSubscription?.paypalStatus,
      endDate: userSubscription?.paypalCurrentPeriodEnd,
      timestamp: new Date().toISOString()
    });

    const isPro = userSubscription?.paypalStatus === "ACTIVE" && 
                 userSubscription?.paypalCurrentPeriodEnd ? 
                 userSubscription.paypalCurrentPeriodEnd.getTime() > Date.now() : 
                 false;

    return NextResponse.json({
      ...userSubscription,
      isPro
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_API] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
