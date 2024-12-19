import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const FREE_CREDITS = 5;

export const checkSubscription = async () => {
  try {
    const { userId } = auth();
    if (!userId) {
      return false;
    }

    const subscription = await db.userSubscription.findUnique({
      where: {
        userId: userId,
      },
      select: {
        paypalSubscriptionId: true,
        paypalCurrentPeriodEnd: true,
      }
    });

    if (!subscription) {
      return false;
    }

    const isValid = 
      subscription.paypalSubscriptionId && 
      subscription.paypalCurrentPeriodEnd &&
      subscription.paypalCurrentPeriodEnd.getTime() > Date.now();

    return isValid;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};

export const increaseApiLimit = async () => {
  try {
    const { userId } = auth();
    if (!userId) return;

    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId: userId }
    });

    if (userApiLimit) {
      await db.userApiLimit.update({
        where: { userId: userId },
        data: { count: userApiLimit.count + 1 },
      });
    } else {
      await db.userApiLimit.create({
        data: { userId: userId, count: 1 }
      });
    }
  } catch (error) {
    console.error("Error increasing API limit:", error);
  }
};

export const checkApiLimit = async () => {
  try {
    const { userId } = auth();
    if (!userId) return false;

    // Check if user is subscribed
    const isPro = await checkSubscription();
    if (isPro) return true;

    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId: userId }
    });

    if (!userApiLimit || userApiLimit.count < FREE_CREDITS) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking API limit:", error);
    return false;
  }
};

export const getApiLimitCount = async () => {
  try {
    const { userId } = auth();
    if (!userId) return 0;

    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId }
    });

    if (!userApiLimit) {
      return 0;
    }

    return userApiLimit.count;
  } catch (error) {
    console.error("Error getting API limit count:", error);
    return 0;
  }
};
