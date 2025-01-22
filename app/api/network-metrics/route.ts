// app/api/network-metrics/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prismadb from "@/lib/prismadb";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const body = await req.json();
    const { latency, bandwidth, packetLoss, status, metadata } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!latency || !bandwidth) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.NETWORK_ANALYSIS),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    // Create network metrics entry
    const metrics = await prismadb.networkMetrics.create({
      data: {
        userId,
        latency,
        bandwidth,
        packetLoss: packetLoss || 0,
        status: status || "active",
        metadata: metadata || {},
      },
    });

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.NETWORK_ANALYSIS);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[NETWORK_METRICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") as "day" | "week" | "month") || "day";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const startDate = new Date();
    switch (timeframe) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }

    const metrics = await prismadb.networkMetrics.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[NETWORK_METRICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
