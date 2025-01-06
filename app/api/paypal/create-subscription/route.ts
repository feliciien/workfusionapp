import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { createNeonClient } from "@/lib/db";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId } = await req.json();
    
    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 });
    }

    const db = createNeonClient();

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId: userId,
        paypalSubscriptionId: planId,
        status: "PENDING"
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}