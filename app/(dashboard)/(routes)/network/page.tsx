import { Network } from "lucide-react";
import { Heading } from "@/components/heading";
import { NetworkDashboard } from "@/components/network/network-dashboard";
import { checkSubscription } from "@/lib/subscription";
import { getNetworkMetrics } from "@/lib/network-monitor";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { NetworkHealth, NetworkMetrics } from "@/types/network";

const defaultHealth: NetworkHealth = {
  score: 0,
  status: 'fair',
  recommendations: []
};

export default async function NetworkPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  const isPro = await checkSubscription(userId);

  let metrics: NetworkMetrics | undefined;
  let health: NetworkHealth = defaultHealth;

  try {
    const result = await getNetworkMetrics(userId);
    metrics = result.metrics;
    health = result.health;
  } catch (error) {
    console.error('Error fetching network metrics:', error);
  }

  return (
    <div>
      <Heading
        title="Network Monitor"
        description="Monitor and analyze your network performance metrics"
        icon={Network}
        iconColor="text-cyan-500"
        bgColor="bg-cyan-500/10"
      />
      <div className="px-4 lg:px-8">
        <NetworkDashboard
          metrics={metrics}
          health={health}
          isPro={isPro}
        />
      </div>
    </div>
  );
}
