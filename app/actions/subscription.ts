'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSubscriptionStatus() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        message: "Unauthorized",
        isPro: false,
      };
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.email,
      },
      select: {
        status: true,
        priceId: true,
        currentPeriodEnd: true,
      }
    });

    if (!subscription) {
      return {
        success: true,
        isPro: false,
        subscription: null,
      };
    }

    const isActive = subscription.status === "active";
    const currentPeriodEnd = subscription.currentPeriodEnd;
    const isValid = currentPeriodEnd ? new Date(currentPeriodEnd) > new Date() : false;

    return {
      success: true,
      isPro: isActive && isValid,
      subscription: {
        ...subscription,
        isActive,
        isValid,
      },
    };
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_ERROR]", error);
    return {
      success: false,
      message: "Failed to fetch subscription status",
      isPro: false,
    };
  }
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    await prisma.subscription.update({
      where: {
        userId: session.user.email,
      },
      data: {
        status: status,
        subscriptionId: subscriptionId,
      },
    });

    return {
      success: true,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    console.error("[UPDATE_SUBSCRIPTION_ERROR]", error);
    return {
      success: false,
      message: "Failed to update subscription",
    };
  }
}
