import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { db } from "@/lib/db";
import { prismaEdge } from "@/lib/prisma-edge";

const SUBSCRIPTION_CHECK_CACHE: { [key: string]: { result: boolean; timestamp: number } } =
  (globalThis as any).SUBSCRIPTION_CHECK_CACHE ||
  ((globalThis as any).SUBSCRIPTION_CHECK_CACHE = {});

const CACHE_TTL = 60 * 1000; // 1 minute cache
const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (_userId?: string): Promise<boolean> => {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    const userId = _userId || session?.user?.id;

    console.log("[SUBSCRIPTION_CHECK] Starting check:", {
      userId,
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
    });

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
        timestamp: new Date().toISOString(),
      });
      return cached.result;
    }

    // First ensure user exists
    const user = await db.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });

    console.log("[SUBSCRIPTION_CHECK] User record:", {
      userId,
      userExists: !!user,
      timestamp: new Date().toISOString(),
    });

    const userSubscription = await prismaEdge.userSubscription.findUnique({
      where: {
        userId: userId,
      },
      select: {
        paypalSubscriptionId: true,
        paypalCurrentPeriodEnd: true,
        paypalCustomerId: true,
        paypalPlanId: true,
        paypalStatus: true,
      },
    });

    console.log("[SUBSCRIPTION_CHECK] Edge subscription:", {
      userId,
      hasSubscription: !!userSubscription,
      subscriptionDetails: userSubscription
        ? {
            id: userSubscription.paypalSubscriptionId,
            customerId: userSubscription.paypalCustomerId,
            planId: userSubscription.paypalPlanId,
            currentPeriodEnd: userSubscription.paypalCurrentPeriodEnd,
            status: userSubscription.paypalStatus,
          }
        : null,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString(),
    });

    if (!userSubscription) {
      return false;
    }

    const isValid =
      userSubscription.paypalStatus === "ACTIVE" &&
      userSubscription.paypalCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    console.log("[SUBSCRIPTION_CHECK] Validation result:", {
      userId,
      currentTime: new Date(Date.now()).toISOString(),
      endTime: userSubscription.paypalCurrentPeriodEnd?.getTime()
        ? new Date(userSubscription.paypalCurrentPeriodEnd?.getTime()).toISOString()
        : null,
      isValid,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString(),
    });

    // Cache the result
    SUBSCRIPTION_CHECK_CACHE[userId] = {
      result: isValid,
      timestamp: Date.now(),
    };

    return isValid;
  } catch (error: any) {
    console.error("[SUBSCRIPTION_CHECK_ERROR] Failed to check subscription:", {
      error: error?.message || String(error),
      stack: error?.stack || new Error().stack,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
};
