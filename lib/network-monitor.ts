import { NetworkMetrics, NetworkHealth } from "@/types/network";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const DEFAULT_TEST_HOST = "8.8.8.8"; // Google's DNS server as a reliable test target

export async function getNetworkMetrics(userId: string): Promise<{ metrics: NetworkMetrics; health: NetworkHealth }> {
  try {
    const pingResults = await measureLatency();
    const bandwidthResults = await estimateBandwidth();
    const packetLossResults = await measurePacketLoss();

    const metrics: NetworkMetrics = {
      latency: [{ value: pingResults.latency, timestamp: new Date() }],
      bandwidth: [{ value: bandwidthResults, timestamp: new Date() }],
      packetLoss: [{ value: packetLossResults, timestamp: new Date() }],
      jitter: [{ value: pingResults.jitter, timestamp: new Date() }],
      healthScore: calculateHealthScore(pingResults.latency, bandwidthResults, packetLossResults),
      status: determineNetworkStatus(pingResults.latency, bandwidthResults, packetLossResults)
    };

    const health: NetworkHealth = {
      score: metrics.healthScore,
      status: metrics.status,
      recommendations: generateRecommendations(metrics)
    };

    return { metrics, health };
  } catch (error) {
    console.error("Error in network monitoring:", error);
    return {
      metrics: getDefaultMetrics(),
      health: getDefaultHealth()
    };
  }
}

async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  try {
    const { stdout } = await execAsync(`ping -c 5 ${DEFAULT_TEST_HOST}`);
    const lines = stdout.split('\n');
    const times = lines
      .filter(line => line.includes('time='))
      .map(line => parseFloat(line.split('time=')[1].split(' ')[0]));

    const latency = times.reduce((a, b) => a + b, 0) / times.length;
    const jitter = calculateJitter(times);

    return { latency, jitter };
  } catch (error) {
    console.error('Error measuring latency:', error);
    return { latency: 0, jitter: 0 };
  }
}

async function estimateBandwidth(): Promise<number> {
  // Simplified bandwidth estimation
  // In a real implementation, you might want to use speedtest-net or a similar package
  return 100; // Mock value in Mbps
}

async function measurePacketLoss(): Promise<number> {
  try {
    const { stdout } = await execAsync(`ping -c 10 ${DEFAULT_TEST_HOST}`);
    const transmitted = parseInt(stdout.match(/(\d+) packets transmitted/)?.[1] || '0');
    const received = parseInt(stdout.match(/(\d+) packets received/)?.[1] || '0');
    
    if (transmitted === 0) return 0;
    return ((transmitted - received) / transmitted) * 100;
  } catch (error) {
    console.error('Error measuring packet loss:', error);
    return 0;
  }
}

function calculateJitter(times: number[]): number {
  if (times.length < 2) return 0;
  
  let totalJitter = 0;
  for (let i = 1; i < times.length; i++) {
    totalJitter += Math.abs(times[i] - times[i - 1]);
  }
  
  return totalJitter / (times.length - 1);
}

function calculateHealthScore(latency: number, bandwidth: number, packetLoss: number): number {
  // Simple scoring algorithm - can be made more sophisticated
  const latencyScore = Math.max(0, 100 - latency);
  const bandwidthScore = Math.min(100, bandwidth);
  const packetLossScore = Math.max(0, 100 - (packetLoss * 10));

  return Math.round((latencyScore + bandwidthScore + packetLossScore) / 3);
}

function determineNetworkStatus(latency: number, bandwidth: number, packetLoss: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  const score = calculateHealthScore(latency, bandwidth, packetLoss);
  
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

function generateRecommendations(metrics: NetworkMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.latency[0]?.value > 100) {
    recommendations.push("High latency detected. Consider checking your network connection or switching to a closer server.");
  }

  if (metrics.bandwidth[0]?.value < 50) {
    recommendations.push("Low bandwidth detected. Consider upgrading your internet plan or checking for background downloads.");
  }

  if (metrics.packetLoss[0]?.value > 1) {
    recommendations.push("Packet loss detected. Check for network interference or faulty equipment.");
  }

  if (metrics.jitter[0]?.value > 30) {
    recommendations.push("High jitter detected. This may affect real-time applications. Consider using a wired connection.");
  }

  return recommendations;
}

function getDefaultMetrics(): NetworkMetrics {
  return {
    latency: [],
    bandwidth: [],
    packetLoss: [],
    jitter: [],
    healthScore: 0,
    status: 'fair'
  };
}

function getDefaultHealth(): NetworkHealth {
  return {
    score: 0,
    status: 'fair',
    recommendations: ["Unable to perform network tests. Please check your connection."]
  };
}
