import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const FREE_CREDITS = 5;

export const checkSubscription = async () => {
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
};

export const increaseApiLimit = async () => {
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
};

export const checkApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
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
};

export const getApiLimitCount = async () => {
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
};
