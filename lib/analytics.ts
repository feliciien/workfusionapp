import prismadb from "@/lib/prismadb";

export type AnalyticsEventType = 
  | "api_call"
  | "error"
  | "subscription_update"
  | "conversation_created"
  | "conversation_shared"
  | "settings_updated";

export async function trackEvent(
  userId: string,
  eventType: AnalyticsEventType,
  eventData: any
) {
  try {
    await prismadb.analytics.create({
      data: {
        userId,
        eventType,
        eventData,
      },
    });
  } catch (error) {
    console.error("Failed to track analytics event:", error);
  }
}

export async function getAnalytics(userId: string, options: {
  startDate?: Date;
  endDate?: Date;
  eventType?: AnalyticsEventType;
}) {
  const { startDate, endDate, eventType } = options;
  
  const where: any = { userId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  
  if (eventType) {
    where.eventType = eventType;
  }

  return prismadb.analytics.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getApiUsageStats(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const apiCalls = await prismadb.analytics.findMany({
    where: {
      userId,
      eventType: "api_call",
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  // Group by date
  const dailyUsage = apiCalls.reduce((acc: Record<string, number>, call) => {
    const date = call.createdAt.toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return dailyUsage;
}

export async function getErrorStats(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return prismadb.analytics.findMany({
    where: {
      userId,
      eventType: "error",
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
