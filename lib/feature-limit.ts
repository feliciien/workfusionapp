import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { FREE_LIMITS, FEATURE_TYPES } from "@/constants";
import { checkSubscription } from "@/lib/subscription";
import type { PrismaClient } from '@prisma/client/edge';
import { authOptions } from "@/auth";

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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

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
    handleError(error, 'INCREMENT_FEATURE_USAGE');
  }
};

export const checkFeatureLimit = async (featureType: FeatureType): Promise<boolean> => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return false;
    }

    const isPro = await checkSubscription();
    if (isPro) {
      return true;
    }

    const usage = await getFeatureUsage(featureType);
    const limit = FREE_LIMITS[featureType] || 0;

    return usage < limit;
  } catch (error) {
    handleError(error, 'CHECK_FEATURE_LIMIT');
    return false;
  }
};

export const getFeatureUsage = async (featureType: FeatureType): Promise<number> => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return 0;
    }

    const usage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType
        }
      },
    });

    return usage?.count || 0;
  } catch (error) {
    handleError(error, 'GET_FEATURE_USAGE');
    return 0;
  }
};
