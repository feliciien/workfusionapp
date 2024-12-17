import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";
import { headers } from "next/headers";

const FREE_CREDITS = 5;

export const checkSubscription = async () => {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-auth-userId');

    if (!userId) {
      return false;
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
      select: {
        paypalStatus: true,
        paypalCurrentPeriodEnd: true,
      },
    });

    if (!userSubscription) {
      return false;
    }

    const isValid =
      userSubscription.paypalStatus === "ACTIVE" &&
      userSubscription.paypalCurrentPeriodEnd != null &&
      userSubscription.paypalCurrentPeriodEnd.getTime() > Date.now();

    return !!isValid;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};

export const increaseApiLimit = async () => {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-auth-userId');

    if (!userId) {
      return;
    }

    // First, ensure the user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      await prismadb.user.create({
        data: { id: userId }
      });
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: {
        userId,
      },
    });

    if (!userApiLimit) {
      await prismadb.userApiLimit.create({
        data: {
          userId,
          count: 1,
        },
      });
    } else {
      await prismadb.userApiLimit.update({
        where: {
          userId,
        },
        data: {
          count: userApiLimit.count + 1,
        },
      });
    }
  } catch (error) {
    console.error("Error increasing API limit:", error);
  }
};

export const checkApiLimit = async () => {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-auth-userId');

    if (!userId) {
      return true; // Allow access for public routes
    }

    // Check if user is subscribed
    const isPro = await checkSubscription();
    if (isPro) {
      return true; // Pro users have unlimited access
    }

    // Ensure user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      await prismadb.user.create({
        data: { id: userId }
      });
      return true; // First time users get free credits
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: { userId }
    });

    if (!userApiLimit) {
      return true; // No usage yet, they have free credits
    }

    return userApiLimit.count < FREE_CREDITS;
  } catch (error) {
    console.error("Error checking API limit:", error);
    return true; // On error, allow access to avoid blocking users
  }
};

export const getApiLimitCount = async () => {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-auth-userId');

    if (!userId) {
      return 0;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: {
        userId,
      },
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
