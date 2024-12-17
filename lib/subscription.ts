import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const checkSubscription = async (): Promise<boolean> => {
  try {
    const { userId } = auth();

    if (!userId) {
      return false;
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId
      },
      select: {
        userId: true,
        paypalCurrentPeriodEnd: true,
        paypalStatus: true,
        paypalSubscriptionId: true,
      }
    });

    if (!userSubscription) {
      return false;
    }

    const isValid =
      userSubscription.paypalStatus === "ACTIVE" &&
      userSubscription.paypalCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return !!isValid;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};