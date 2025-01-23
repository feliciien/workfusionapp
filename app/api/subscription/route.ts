import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!userSubscription) {
      return NextResponse.json({ isPro: false });
    }

    const isPro =
      userSubscription.paypalStatus === "ACTIVE" ||
      userSubscription.paypalStatus === "active" ||
      userSubscription.paypalStatus === "APPROVED";

    return NextResponse.json({ isPro });
  } catch (error) {
    console.error("[SUBSCRIPTION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json();

    if (!userId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await prisma.userSubscription.update({
      where: {
        userId: userId,
      },
      data: {
        paypalStatus: status,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUBSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
