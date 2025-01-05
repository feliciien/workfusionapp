import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserSubscriptionId, checkSubscription } from "@/lib/subscription";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscriptionId = await getUserSubscriptionId();
    const isSubscribed = await checkSubscription();

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      subscriptionId,
      isSubscribed,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("[PAYPAL_GET_SUBSCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}