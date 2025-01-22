import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json(userSubscription);
  } catch (error) {
    console.error("[SUBSCRIPTION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
