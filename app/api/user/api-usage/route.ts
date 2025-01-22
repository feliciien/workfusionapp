import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { FEATURE_TYPES } from "@/constants";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const headersList = headers();
    const path = headersList.get("x-pathname");

    const usage = await prisma.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId: userId,
          featureType: FEATURE_TYPES.API_USAGE,
        },
      },
      select: {
        count: true,
      },
    });

    console.log("[API_USAGE] User status:", {
      userId,
      usage,
      path,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(usage || { count: 0 });
  } catch (error) {
    console.error("[API_USAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
