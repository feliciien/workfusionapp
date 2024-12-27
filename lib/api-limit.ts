import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";

const FREE_CREDITS = 5;

export const increaseApiLimit = async () => {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return;
    }

    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId: userId },
    });

    if (userApiLimit) {
      await db.userApiLimit.update({
        where: { userId: userId },
        data: { count: userApiLimit.count + 1 },
      });
    } else {
      await db.userApiLimit.create({
        data: { userId: userId, count: 1 },
      });
    }
  } catch (error) {
    console.error("[INCREASE_API_LIMIT_ERROR]", error);
  }
};

export const checkApiLimit = async () => {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return false;
    }

    const isPro = await checkSubscription();
    if (isPro) {
      return true;
    }

    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId: userId },
    });

    if (!userApiLimit || userApiLimit.count < FREE_CREDITS) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[CHECK_API_LIMIT_ERROR]", error);
    return false;
  }
};

export const getApiLimitCount = async () => {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return 0;
    }

    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId },
    });

    if (!userApiLimit) {
      return 0;
    }

    return userApiLimit.count;
  } catch (error) {
    console.error("[GET_API_LIMIT_COUNT_ERROR]", error);
    return 0;
  }
};
