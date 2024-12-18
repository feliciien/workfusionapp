import prismadb from "@/lib/prismadb";

export interface NetworkMetrics {
  latency: number[];
  bandwidth: number[];
  uptime: number;
  healthScore: number;
  timestamps: string[];
}

interface NetworkMetricRecord {
  id: string;
  userId: string;
  timestamp: Date;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  status: string;
  metadata: any;
}

export async function getNetworkMetrics(userId: string, timeframe: 'day' | 'week' | 'month' = 'day'): Promise<NetworkMetrics> {
  // TODO: Replace with actual database query once migration is complete
  // Generating mock data for development
  const dataPoints = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
  const mockData: NetworkMetrics = {
    latency: Array(dataPoints).fill(0).map(() => Math.random() * 100 + 20), // 20-120ms
    bandwidth: Array(dataPoints).fill(0).map(() => Math.random() * 50 + 10), // 10-60 Mbps
    uptime: 99.9,
    healthScore: 95,
    timestamps: Array(dataPoints).fill(0).map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (dataPoints - i));
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    })
  };

  return mockData;
}

function calculateHealthScore(metrics: NetworkMetricRecord[]): number {
  if (metrics.length === 0) return 100;

  // Get the latest metrics
  const latest = metrics[metrics.length - 1];

  // Define thresholds
  const LATENCY_THRESHOLD = 100; // ms
  const BANDWIDTH_THRESHOLD = 50; // Mbps
  const PACKET_LOSS_THRESHOLD = 1; // %

  // Calculate individual scores
  const latencyScore = Math.max(0, 100 - (latest.latency / LATENCY_THRESHOLD * 100));
  const bandwidthScore = (latest.bandwidth / BANDWIDTH_THRESHOLD) * 100;
  const packetLossScore = Math.max(0, 100 - (latest.packetLoss / PACKET_LOSS_THRESHOLD * 100));

  // Calculate weighted average
  const weightedScore = (
    latencyScore * 0.4 +
    bandwidthScore * 0.4 +
    packetLossScore * 0.2
  );

  return Math.min(100, Math.max(0, weightedScore));
}
