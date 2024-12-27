import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

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

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId,
      }
    });

    console.log("[SUBSCRIPTION_API] Database result:", {
      userId,
      hasSubscription: !!userSubscription,
      subscriptionDetails: userSubscription ? {
        status: userSubscription.paypalStatus,
        endDate: userSubscription.paypalCurrentPeriodEnd,
      } : null,
      timestamp: new Date().toISOString()
    });

    if (!userSubscription) {
      console.log("[SUBSCRIPTION_API] No subscription found");
      return NextResponse.json({ isPro: false });
    }

    const currentTime = Date.now();
    const endTime = userSubscription.paypalCurrentPeriodEnd?.getTime() || 0;
    const gracePeriod = 86_400_000; // 24 hours

    const isValid = 
      userSubscription.paypalStatus === "ACTIVE" &&
      endTime + gracePeriod > currentTime;

    console.log("[SUBSCRIPTION_API] Validation check:", {
      userId,
      status: userSubscription.paypalStatus,
      currentTime: new Date(currentTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      gracePeriodEnd: new Date(endTime + gracePeriod).toISOString(),
      isValid,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ isPro: isValid });
  } catch (error) {
    console.error("[SUBSCRIPTION_API_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
