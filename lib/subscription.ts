import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const SUBSCRIPTION_CHECK_CACHE: { [key: string]: { result: boolean; timestamp: number } } = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache
const DAY_IN_MS = 86_400_000;

export async function getUserSubscriptionId(userId: string) {
  try {
    if (!userId) {
      return null;
    }

    const userWithSubscription = await db.user.findUnique({
      where: {
        id: userId,
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

export async function checkSubscription(userId: string) {
  try {
    if (!userId) {
      return false;
    }

    // Check cache first
    const cachedResult = SUBSCRIPTION_CHECK_CACHE[userId];
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      return cachedResult.result;
    }

    const subscription = await db.subscription.findUnique({
      where: {
        userId,
      },
      select: {
        status: true,
        currentPeriodEnd: true,
      }
    });

    if (!subscription) {
      SUBSCRIPTION_CHECK_CACHE[userId] = { result: false, timestamp: Date.now() };
      return false;
    }

    if (!subscription.currentPeriodEnd) {
      SUBSCRIPTION_CHECK_CACHE[userId] = { result: false, timestamp: Date.now() };
      return false;
    }

    const isValid = 
      subscription.status === "active" &&
      subscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

    SUBSCRIPTION_CHECK_CACHE[userId] = { result: isValid, timestamp: Date.now() };
    return isValid;
  } catch (error) {
    console.error("[CHECK_SUBSCRIPTION_ERROR]", error);
    return false;
  }
}

export async function checkSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    const subscription = await db.subscription.findUnique({
      where: {
        userId,
      },
      select: {
        status: true,
        currentPeriodEnd: true,
        paypalSubscriptionId: true,
      }
    });

    if (!subscription || !subscription.currentPeriodEnd) {
      return false;
    }

    // If subscription has a currentPeriodEnd date and it's in the future (plus a grace period)
    const isValid = 
      subscription.status === "active" &&
      subscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

    return isValid;
  } catch (error) {
    console.error("[CHECK_SUBSCRIPTION_STATUS_ERROR]", error);
    return false;
  }
}