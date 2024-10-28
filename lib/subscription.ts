import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

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
      paypalSubscriptionId: true,
      paypalCurrentPeriodEnd: true,
      paypalStatus: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  // Check if the subscription is active and not expired
  const isValid =
    userSubscription.paypalStatus === "ACTIVE" &&
    userSubscription.paypalCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
};