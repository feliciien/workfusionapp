import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const checkSubscription = async (): Promise<boolean> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId,
      },
      select: {
        paypalStatus: true,
        paypalCurrentPeriodEnd: true,
      }
    });

    if (!userSubscription) {
      return false;
    }

    const isValid =
      userSubscription.paypalStatus === "active" &&
      userSubscription.paypalCurrentPeriodEnd?.getTime()! > Date.now();

    return !!isValid;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};