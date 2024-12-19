import { db } from "@/lib/db";
import type { CreateSubscriptionData, Subscription, UpdateSubscriptionData } from "./types";

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const subscription = await db.userSubscription.findUnique({
    where: {
      userId,
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    ...subscription,
    plan: "free" as const,
    status: "active" as const,
    currentPeriodStart: subscription.createdAt,
    currentPeriodEnd: subscription.paypalCurrentPeriodEnd || new Date(),
    generationsUsed: 0,
    maxGenerations: 100,
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
  generationsUsed: number;
  maxGenerations: number;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      isSubscribed: false,
      isCanceled: false,
      isActive: false,
      plan: "free",
      status: "inactive",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      generationsUsed: 0,
      maxGenerations: 100,
    };
  }

  const isSubscribed = subscription.status === "active";
  const isCanceled = subscription.status === "cancelled";
  const isActive = 
    isSubscribed && 
    new Date(subscription.currentPeriodEnd).getTime() > Date.now();

  return {
    isSubscribed,
    isCanceled,
    isActive,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    generationsUsed: subscription.generationsUsed,
    maxGenerations: subscription.maxGenerations,
  };
}

export async function createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
  const subscription = await db.userSubscription.create({
    data: {
      userId: data.userId,
      paypalPlanId: data.paypalPlanId,
      paypalStatus: data.paypalStatus,
      paypalSubscriptionId: data.paypalSubscriptionId,
      paypalCurrentPeriodEnd: data.paypalCurrentPeriodEnd,
    },
  });

  return {
    ...subscription,
    plan: data.plan,
    status: data.status || "active",
    currentPeriodStart: data.currentPeriodStart || subscription.createdAt,
    currentPeriodEnd: data.currentPeriodEnd || subscription.paypalCurrentPeriodEnd || new Date(),
    generationsUsed: data.generationsUsed || 0,
    maxGenerations: data.maxGenerations || 100,
  };
}

export async function updateSubscription(
  userId: string,
  data: UpdateSubscriptionData
): Promise<Subscription> {
  const subscription = await db.userSubscription.update({
    where: {
      userId,
    },
    data: {
      paypalPlanId: data.paypalPlanId,
      paypalStatus: data.paypalStatus,
      paypalSubscriptionId: data.paypalSubscriptionId,
      paypalCurrentPeriodEnd: data.paypalCurrentPeriodEnd,
    },
  });

  return {
    ...subscription,
    plan: data.plan || "free",
    status: data.status || "active",
    currentPeriodStart: data.currentPeriodStart || subscription.createdAt,
    currentPeriodEnd: data.currentPeriodEnd || subscription.paypalCurrentPeriodEnd || new Date(),
    generationsUsed: data.generationsUsed || 0,
    maxGenerations: data.maxGenerations || 100,
  };
}

export async function incrementGenerationsUsed(userId: string): Promise<Subscription> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error("No subscription found");
  }

  const updatedGenerationsUsed = (subscription.generationsUsed || 0) + 1;
  
  return updateSubscription(userId, {
    generationsUsed: updatedGenerationsUsed,
  });
}

export async function deleteSubscription(userId: string): Promise<void> {
  await db.userSubscription.delete({
    where: {
      userId,
    },
  });
}
