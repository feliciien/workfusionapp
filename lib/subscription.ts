import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { prismaEdge } from "@/lib/prisma-edge";
import { authOptions } from "@/auth";

const SUBSCRIPTION_CHECK_CACHE: { [key: string]: { result: boolean; timestamp: number } } = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache
const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (): Promise<boolean> => {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      console.log("[SUBSCRIPTION_CHECK] No user ID found");
      return false;
    }

    // Check cache first
    const cached = SUBSCRIPTION_CHECK_CACHE[userId];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("[SUBSCRIPTION_CHECK] Returning cached result:", {
        userId,
        result: cached.result,
        timestamp: new Date().toISOString()
      });
      return cached.result;
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      console.log("[SUBSCRIPTION_CHECK] User not found:", {
        userId,
        timestamp: new Date().toISOString()
      });
      SUBSCRIPTION_CHECK_CACHE[userId] = { result: false, timestamp: Date.now() };
      return false;
    }

    // Check subscription status
    const userSubscription = await db.userSubscription.findUnique({
      where: { userId },
      select: {
        paypalStatus: true,
        paypalCurrentPeriodEnd: true
      }
    });

    console.log("[SUBSCRIPTION_CHECK] Subscription record:", {
      userId,
      subscriptionExists: !!userSubscription,
      timestamp: new Date().toISOString(),
      details: userSubscription
    });

    if (!userSubscription) {
      SUBSCRIPTION_CHECK_CACHE[userId] = { result: false, timestamp: Date.now() };
      return false;
    }

    // Validate subscription status and expiration
    const now = Date.now();
    const isActive = userSubscription.paypalStatus === "ACTIVE";
    const isExpired = userSubscription.paypalCurrentPeriodEnd 
      ? userSubscription.paypalCurrentPeriodEnd.getTime() + DAY_IN_MS < now
      : true;

    const isValid = isActive && !isExpired;

    console.log("[SUBSCRIPTION_CHECK] Validation result:", {
      userId,
      isValid,
      isActive,
      isExpired,
      status: userSubscription.paypalStatus,
      endDate: userSubscription.paypalCurrentPeriodEnd,
      timestamp: new Date().toISOString()
    });

    SUBSCRIPTION_CHECK_CACHE[userId] = { result: isValid, timestamp: now };
    return isValid;

  } catch (error) {
    console.error("[SUBSCRIPTION_CHECK] Error:", {
      error,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};