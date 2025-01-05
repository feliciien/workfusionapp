import { db } from "@/lib/db";
import type { CreateSubscriptionData, Subscription, UpdateSubscriptionData, SubscriptionStatus } from "./types";

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const subscription = await db.subscription.findUnique({
    where: {
      userId,
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    ...subscription,
    plan: subscription.planId || "free",
    status: (subscription.status as SubscriptionStatus) || "incomplete",
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd || new Date(),
  };
}

export async function getSubscriptionStatus(userId: string): Promise<{
  isSubscribed: boolean;
  isCanceled: boolean;
  isActive: boolean;
  plan: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      isSubscribed: false,
      isCanceled: false,
      isActive: false,
      plan: "free",
      status: "incomplete",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
    };
  }

  const periodEnd = subscription.currentPeriodEnd || new Date();
  const isActive = subscription.status === "active" && periodEnd.getTime() > Date.now();

  return {
    isSubscribed: true,
    isCanceled: subscription.status === "canceled",
    isActive,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: periodEnd,
  };
}

export async function createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
  const subscription = await db.subscription.create({
    data: {
      userId: data.userId,
      planId: data.planId,
      status: data.status || "incomplete",
      paypalSubscriptionId: data.paypalSubscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: data.currentPeriodEnd,
    },
  });

  return {
    ...subscription,
    plan: subscription.planId || "free",
    status: (subscription.status as SubscriptionStatus) || "incomplete",
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd || new Date(),
  };
}

export async function updateSubscription(
  userId: string,
  data: UpdateSubscriptionData
): Promise<Subscription> {
  const subscription = await db.subscription.update({
    where: {
      userId,
    },
    data: {
      planId: data.planId,
      status: data.status || "incomplete",
      paypalSubscriptionId: data.paypalSubscriptionId,
      currentPeriodEnd: data.currentPeriodEnd,
    },
  });

  return {
    ...subscription,
    plan: subscription.planId || "free",
    status: (subscription.status as SubscriptionStatus) || "incomplete",
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd || new Date(),
  };
}

export async function deleteSubscription(userId: string): Promise<void> {
  await db.subscription.delete({
    where: {
      userId,
    },
  });
}
