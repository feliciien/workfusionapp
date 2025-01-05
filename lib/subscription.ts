import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { prismaEdge } from "@/lib/prisma-edge";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

const SUBSCRIPTION_CHECK_CACHE: { [key: string]: { result: boolean; timestamp: number } } = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache
const DAY_IN_MS = 86_400_000;

export async function getUserSubscriptionId() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.email) {
      return null;
    }

    const userWithSubscription = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
      select: {
        subscription: {
          select: {
            paypalSubscriptionId: true,
          },
        },
      },
    });

    if (!userWithSubscription?.subscription) {
      return null;
    }

    return userWithSubscription.subscription.paypalSubscriptionId;
  } catch (error) {
    console.error("[GET_USER_SUBSCRIPTION_ID]", error);
    return null;
  }
}

export async function checkSubscription() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.email) {
      return false;
    }

    const userWithSubscription = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
      select: {
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!userWithSubscription?.subscription) {
      return false;
    }

    const subscription = userWithSubscription.subscription;

    return (
      subscription.status === "active" &&
      subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()
    );
  } catch (error) {
    console.error("[CHECK_SUBSCRIPTION]", error);
    return false;
  }
}

export const checkSubscriptionStatus = async (): Promise<boolean> => {
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
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
        currentPeriodEnd: true
      }
    });

    console.log("[SUBSCRIPTION_CHECK] Subscription record:", {
      userId,
      subscriptionExists: !!subscription,
      timestamp: new Date().toISOString(),
      details: subscription
    });

    if (!subscription) {
      SUBSCRIPTION_CHECK_CACHE[userId] = { result: false, timestamp: Date.now() };
      return false;
    }

    // Validate subscription status and expiration
    const now = Date.now();
    const isActive = subscription.status === "active";
    const isExpired = subscription.currentPeriodEnd 
      ? subscription.currentPeriodEnd.getTime() + DAY_IN_MS < now
      : true;

    const isValid = isActive && !isExpired;

    console.log("[SUBSCRIPTION_CHECK] Validation result:", {
      userId,
      isValid,
      isActive,
      isExpired,
      status: subscription.status,
      endDate: subscription.currentPeriodEnd,
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