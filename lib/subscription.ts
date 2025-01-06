import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (userId: string) => {
  try {
    if (!userId) {
      return false;
    }

    const subscription = await prismadb.subscription.findUnique({
      where: {
        userId: userId,
      },
      select: {
        status: true,
        currentPeriodEnd: true,
        paypalSubscriptionId: true,
      },
    });

    if (!subscription) {
      return false;
    }

    // Check if subscription is active and not expired
    // Add a day buffer to handle timezone differences
    const isValid =
      subscription.status === "active" &&
      subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return !!isValid;
  } catch (error) {
    console.error("[CHECK_SUBSCRIPTION_ERROR]", error);
    return false;
  }
};