// lib/feature-limit.ts

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { db } from "@/lib/db";
import { FREE_DAILY_LIMIT } from "@/constants";
import { checkSubscription } from "@/lib/subscription";
import type { PrismaClient } from "@prisma/client/edge";

type TransactionClient = Omit<
  PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
>;

interface DatabaseError extends Error {
  code?: string;
}

const handleError = (error: unknown, context: string) => {
  const dbError = error as DatabaseError;
  console.error(`[${context}] Error:`, {
    code: dbError.code || "UNKNOWN",
    message: dbError.message || "An unknown error occurred",
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const incrementFeatureUsage = async (featureType: string): Promise<void> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return;
    }

    const userId = session.user.id;
    const today = new Date();

    await db.$transaction(async (prisma: TransactionClient) => {
      const userFeatureUsage = await prisma.userFeatureUsage.findUnique({
        where: {
          userId_featureType: {
            userId,
            featureType,
          },
        },
      });

      if (userFeatureUsage) {
        // Reset count if it's a new day
        const lastUpdated = new Date(userFeatureUsage.updatedAt);
        const count = isSameDay(today, lastUpdated) ? userFeatureUsage.count + 1 : 1;

        await prisma.userFeatureUsage.update({
          where: {
            userId_featureType: {
              userId,
              featureType,
            },
          },
          data: {
            count,
            updatedAt: today,
          },
        });
      } else {
        await prisma.userFeatureUsage.create({
          data: {
            userId,
            featureType,
            count: 1,
            updatedAt: today,
          },
        });
      }
    });
  } catch (error) {
    handleError(error, "INCREASE_FEATURE_USAGE_ERROR");
  }
};

export const checkFeatureLimit = async (featureType: string): Promise<boolean> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return false;
    }

    const userId = session.user.id;

    const isPro = await checkSubscription();
    if (isPro) {
      return true;
    }

    const userFeatureUsage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType,
        },
      },
    });

    if (!userFeatureUsage) {
      return true;
    }

    // Check if the last usage was from a different day
    const lastUpdated = new Date(userFeatureUsage.updatedAt);
    const today = new Date();
    
    if (!isSameDay(today, lastUpdated)) {
      return true;
    }

    return userFeatureUsage.count < FREE_DAILY_LIMIT;
  } catch (error) {
    console.error("[CHECK_FEATURE_LIMIT_ERROR]", error);
    return false;
  }
};

export const getFeatureUsage = async (featureType: string): Promise<number> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return 0;
    }

    const userId = session.user.id;

    const userFeatureUsage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType,
        },
      },
    });

    if (!userFeatureUsage) {
      return 0;
    }

    // Return 0 if it's a new day
    const lastUpdated = new Date(userFeatureUsage.updatedAt);
    const today = new Date();
    
    if (!isSameDay(today, lastUpdated)) {
      return 0;
    }

    return userFeatureUsage.count;
  } catch (error) {
    console.error("[GET_FEATURE_USAGE_ERROR]", error);
    return 0;
  }
};
