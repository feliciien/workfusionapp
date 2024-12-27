// /app/api/user/api-usage/route.ts

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismaEdge } from "@/lib/prisma-edge";
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
    const userApiLimit = await prismaEdge.userApiLimit.findUnique({
      where: {
        userId: userId
      }
    });

    if (!userApiLimit) {
      return new NextResponse(
        JSON.stringify({
          apiLimitCount: 0,
          apiLimitRemaining: FREE_CREDITS
        })
      );
    }

    return new NextResponse(
      JSON.stringify({
        apiLimitCount: userApiLimit.count,
        apiLimitRemaining: Math.max(FREE_CREDITS - userApiLimit.count, 0)
      })
    );

  } catch (error) {
    console.error("[API_LIMIT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}