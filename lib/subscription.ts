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
    
    console.log("[SUBSCRIPTION_CHECK] Starting check:", {
      userId,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
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
        timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    });

    const userSubscription = await prismaEdge.userSubscription.findUnique({
      where: {
        userId: userId,
      },
    });

    console.log("[SUBSCRIPTION_CHECK] Subscription record:", {
      userId,
      subscriptionExists: !!userSubscription,
      timestamp: new Date().toISOString()
    });

    if (!userSubscription) {
      SUBSCRIPTION_CHECK_CACHE[userId] = { result: false, timestamp: Date.now() };
      return false;
    }

    const isValid =
      userSubscription.paypalStatus === "ACTIVE" &&
      userSubscription.paypalCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    console.log("[SUBSCRIPTION_CHECK] Validation result:", {
      userId,
      isValid,
      status: userSubscription.paypalStatus,
      endDate: userSubscription.paypalCurrentPeriodEnd,
      timestamp: new Date().toISOString()
    });

    SUBSCRIPTION_CHECK_CACHE[userId] = { result: isValid, timestamp: Date.now() };
    return isValid;
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECK] Error:", {
      error,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};