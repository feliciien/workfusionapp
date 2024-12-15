import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const FREE_CREDITS = 5;

export const checkSubscription = async () => {
  try {
    const { userId } = auth();

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
    const { userId } = auth();

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
    const { userId } = auth();

    if (!userId) {
      return true; // Allow access for public routes
    }

    // Ensure user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      await prismadb.user.create({
        data: { id: userId }
      });
      return true; // New users get free credits
    }

    const isPro = await checkSubscription();
    
    if (isPro) {
      return true;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: {
        userId,
      },
    });

    if (!userApiLimit || userApiLimit.count < FREE_CREDITS) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking API limit:", error);
    return true; // Allow access on error
  }
};

export const getApiLimitCount = async () => {
  try {
    const { userId } = auth();

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
