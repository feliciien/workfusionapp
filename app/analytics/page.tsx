import { Metadata } from "next";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getAnalytics, getApiUsageStats, getErrorStats } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Analytics | SynthAI",
  description: "View your usage statistics and analytics.",
};

export default async function AnalyticsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [analytics, apiUsage, errors] = await Promise.all([
    getAnalytics(userId, { 
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
    }),
    getApiUsageStats(userId),
    getErrorStats(userId),
  ]);

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your usage, monitor performance, and optimize your experience.
        </p>
      </div>
      
      <AnalyticsDashboard 
        analytics={analytics}
        apiUsage={apiUsage}
        errors={errors}
      />
    </div>
  );
}
