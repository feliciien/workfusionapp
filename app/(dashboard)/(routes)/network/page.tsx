import { Network } from "lucide-react";
import { Heading } from "@/components/heading";
import { NetworkDashboard } from "@/components/network/network-dashboard";
import { checkSubscription } from "@/lib/subscription";
import { getNetworkMetrics } from "@/lib/network-metrics";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function NetworkPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  const isPro = await checkSubscription();

  // Fetch network metrics for different timeframes
  const [dailyMetrics, weeklyMetrics, monthlyMetrics] = await Promise.all([
    getNetworkMetrics(userId, "day"),
    getNetworkMetrics(userId, "week"),
    getNetworkMetrics(userId, "month"),
  ]);

  return (
    <div>
      <Heading
        title="Network Monitor"
        description="Monitor and analyze your network performance metrics"
        icon={Network}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <NetworkDashboard
          dailyMetrics={dailyMetrics}
          weeklyMetrics={weeklyMetrics}
          monthlyMetrics={monthlyMetrics}
          isPro={isPro}
        />
      </div>
    </div>
  );
}
