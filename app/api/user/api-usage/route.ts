// /app/api/user/api-usage/route.ts

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb"; // Adjust the path as per your project structure
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const FREE_CREDITS = 5;

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user data from the database
    const userApiLimit = await prisma.userApiLimit.findUnique({
      where: { userId },
      select: {
        count: true,
      },
    });

    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId },
      select: {
        paypalStatus: true,
        paypalCurrentPeriodEnd: true,
      },
    });

    if (!userApiLimit || !userSubscription) {
      return new NextResponse("User not found", { status: 404 });
    }

    const isPro = 
      userSubscription?.paypalStatus === 'ACTIVE' && 
      userSubscription?.paypalCurrentPeriodEnd ? 
      userSubscription.paypalCurrentPeriodEnd.getTime() > Date.now() : 
      false;

    const usedCredits = userApiLimit?.count ?? 0;
    const remainingFreeCredits = Math.max(0, FREE_CREDITS - usedCredits);

    return NextResponse.json({
      apiLimitCount: usedCredits,
      remainingFreeCredits: isPro ? null : remainingFreeCredits, // null if pro user
      isPro,
    });
  } catch (error) {
    console.error("[API-Usage Error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}