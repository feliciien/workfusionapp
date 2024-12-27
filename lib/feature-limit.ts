import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { FREE_LIMITS, FEATURE_TYPES } from "@/constants";
import { checkSubscription } from "@/lib/subscription";
import type { PrismaClient } from '@prisma/client/edge';

type FeatureType = typeof FEATURE_TYPES[keyof typeof FEATURE_TYPES];
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

interface DatabaseError extends Error {
  code?: string;
}

const handleError = (error: unknown, context: string) => {
  const dbError = error as DatabaseError;
  console.error(`[${context}] Error:`, {
    code: dbError.code || 'UNKNOWN',
    message: dbError.message || 'An unknown error occurred'
  });
};

export const incrementFeatureUsage = async (featureType: FeatureType): Promise<void> => {
  try {
    const { userId } = auth();

    if (!userId) {
      return;
    }

    await db.$transaction(async (prisma: TransactionClient) => {
      const userFeatureUsage = await prisma.userFeatureUsage.findUnique({
        where: {
          userId_featureType: {
            userId,
            featureType
          }
        },
      });

      if (userFeatureUsage) {
        await prisma.userFeatureUsage.update({
          where: {
            userId_featureType: {
              userId,
              featureType
            }
          },
          data: {
            count: userFeatureUsage.count + 1,
          },
        });
      } else {
        await prisma.userFeatureUsage.create({
          data: {
            userId,
            featureType,
            count: 1,
          },
        });
      }
    });
  } catch (error) {
    handleError(error, "INCREASE_FEATURE_USAGE_ERROR");
  }
};

export const checkFeatureLimit = async (featureType: FeatureType): Promise<boolean> => {
  try {
    const { userId } = auth();

    if (!userId) {
      return false;
    }

    const isPro = await checkSubscription();
    if (isPro) {
      return true;
    }

    const userFeatureUsage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType
        }
      },
    });

    const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS] || 100;
    if (!userFeatureUsage || userFeatureUsage.count < limit) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[CHECK_FEATURE_LIMIT_ERROR]", error);
    // If there's an error checking the limit, allow the operation
    return true;
  }
};

export const getFeatureUsage = async (featureType: FeatureType): Promise<number> => {
  try {
    const { userId } = auth();

    if (!userId) {
      return 0;
    }

    const userFeatureUsage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType
        }
      },
    });

    return userFeatureUsage?.count || 0;
  } catch (error) {
    console.error("[GET_FEATURE_USAGE_ERROR]", error);
    return 0;
  }
};
