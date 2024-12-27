import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const SUBSCRIPTION_CHECK_CACHE: { [key: string]: { result: boolean; timestamp: number } } = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache

export const checkSubscription = async (): Promise<boolean> => {
  const start = Date.now();
  try {
    const { userId } = auth();
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

    // Check if user has an active subscription in the database
    const subscription = await db.userSubscription.findFirst({
      where: {
        userId: userId,
        paypalStatus: "ACTIVE",
        paypalCurrentPeriodEnd: {
          gt: new Date(),
        },
      },
      select: {
        paypalSubscriptionId: true,
        paypalCurrentPeriodEnd: true,
        paypalStatus: true,
      }
    });

    console.log("[SUBSCRIPTION_CHECK] Database subscription:", {
      userId,
      hasSubscription: !!subscription,
      subscriptionDetails: subscription ? {
        id: subscription.paypalSubscriptionId,
        status: subscription.paypalStatus,
        currentPeriodEnd: subscription.paypalCurrentPeriodEnd,
      } : null,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString()
    });

    // Check if subscription is active and not expired
    const currentTime = Date.now();
    const endTime = subscription?.paypalCurrentPeriodEnd?.getTime() || 0;
    const gracePeriod = 86_400_000; // 24 hours in milliseconds

    const isValid = Boolean(
      subscription?.paypalSubscriptionId && 
      subscription?.paypalStatus === "ACTIVE" &&
      endTime &&
      endTime + gracePeriod > currentTime
    );

    console.log("[SUBSCRIPTION_CHECK] Validation result:", {
      userId,
      status: subscription?.paypalStatus,
      currentTime: new Date(currentTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
      gracePeriodEnd: endTime ? new Date(endTime + gracePeriod).toISOString() : null,
      isValid,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString()
    });

    // Cache the result
    SUBSCRIPTION_CHECK_CACHE[userId] = {
      result: isValid,
      timestamp: Date.now()
    };

    return isValid;
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECK_ERROR] Failed to check subscription:", {
      error,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString()
    });
    // On error, allow access as a fallback
    return true;
  }
};