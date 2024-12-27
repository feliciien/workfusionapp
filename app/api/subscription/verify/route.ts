import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismaEdge } from "@/lib/prisma-edge";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // Get subscription from database
    const subscription = await prismaEdge.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    // Verify subscription status
    const isValid = ['ACTIVE', 'APPROVED'].includes(subscription.paypalStatus || '');

    return NextResponse.json({ 
      success: true, 
      isValid,
      subscription 
    });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
