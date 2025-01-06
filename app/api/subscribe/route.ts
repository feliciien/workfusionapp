import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prismadb from "@/lib/prismadb";
import { paypal } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, planType } = body;

    if (!subscriptionId || !planType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the subscription with PayPal
    const subscriptionDetails = await paypal.getSubscriptionDetails(subscriptionId);
    
    if (subscriptionDetails.status === "ACTIVE") {
      const now = new Date();
      let expirationDate = new Date(now);

      // Set expiration based on plan type
      if (planType === "yearly") {
        expirationDate.setFullYear(now.getFullYear() + 1);
      } else {
        expirationDate.setMonth(now.getMonth() + 1);
      }

      // Add a day buffer to handle timezone differences
      expirationDate.setDate(expirationDate.getDate() + 1);

      // Get user from database
      const user = await prismadb.user.findUnique({
        where: {
          email: session.user.email
        }
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }
      
      // Update user subscription in database
      await prismadb.subscription.upsert({
        where: {
          userId: user.id
        },
        create: {
          userId: user.id,
          paypalSubscriptionId: subscriptionId,
          planId: planType,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: expirationDate
        },
        update: {
          paypalSubscriptionId: subscriptionId,
          planId: planType,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: expirationDate
        }
      });

      return NextResponse.json({
        success: true,
        message: "Subscription activated successfully"
      });
    } else {
      return new NextResponse("Subscription not active", { status: 400 });
    }
  } catch (error) {
    console.error("[SUBSCRIBE_ERROR]", error);
    return new NextResponse(
      "Internal Error: " + (error instanceof Error ? error.message : "Unknown error"), 
      { status: 500 }
    );
  }
}
