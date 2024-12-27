import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get subscription info
    const subscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId,
      }
    });

    // Get all subscriptions for comparison
    const allSubscriptions = await prismadb.userSubscription.findMany();

    return NextResponse.json({
      clerkUserId: userId,
      userEmail: user.emailAddresses[0]?.emailAddress,
      subscription: subscription,
      allSubscriptions: allSubscriptions,
      now: new Date(),
    });
  } catch (error) {
    console.error("[DEBUG_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
