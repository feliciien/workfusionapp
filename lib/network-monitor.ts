import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import {
  NetworkMetrics,
  NetworkHealth,
  NetworkStatus,
  NetworkMetric,
  NetworkInterface,
  NetworkRecommendation
} from '@/types/network';

const execAsync = promisify(exec);

async function pingHost(host: string, count: number = 5): Promise<{ latency: number; packetLoss: number }> {
  try {
    const { stdout } = await execAsync(`ping -c ${count} ${host}`, { timeout: 10000 });
    
    // Parse ping statistics
    const stats = stdout.split('\n').filter(line => line.includes('packet loss') || line.includes('min/avg/max'));
    const packetLoss = parseFloat(stats[0].match(/(\d+\.?\d*)%/)?.[1] || '0');
    const latency = parseFloat(stats[1]?.match(/\d+\.\d+/)?.[0] || '0');

    return { latency, packetLoss };
  } catch (error) {
    console.error('Error during ping test:', error);
    return { latency: 0, packetLoss: 100 };
  }
}

async function measureBandwidth(): Promise<number> {
  try {
    // TODO: Implement actual speed test using speedtest-net or similar
    // For now, return a simulated value
    const downloadSpeed = Math.random() * 100 + 50; // 50-150 Mbps
    return parseFloat(downloadSpeed.toFixed(2));
  } catch (error) {
    console.error('Error measuring bandwidth:', error);
    return 0;
  }
}

export async function getNetworkMetrics(testHost: string = '8.8.8.8'): Promise<NetworkMetrics> {
  const { latency, packetLoss } = await pingHost(testHost);
  const bandwidth = await measureBandwidth();
  const timestamp = new Date();

  return {
    latency: [{ value: latency, timestamp }],
    bandwidth: [{ value: bandwidth, timestamp }],
    packetLoss: [{ value: packetLoss, timestamp }],
    jitter: [{ value: Math.random() * 5, timestamp }], // TODO: Implement actual jitter measurement
    healthScore: 0, // Will be calculated by calculateNetworkHealth
    status: 'good' // Will be updated by calculateNetworkHealth
  };
}

export function calculateNetworkHealth(metrics: NetworkMetrics): NetworkHealth {
  // Calculate health score based on latest metrics
  const getLatestValue = (arr: NetworkMetric[]) => arr[arr.length - 1]?.value ?? 0;
  
  const latency = getLatestValue(metrics.latency);
  const bandwidth = getLatestValue(metrics.bandwidth);
  const packetLoss = getLatestValue(metrics.packetLoss);
  const jitter = getLatestValue(metrics.jitter);

  // Weight factors for each metric
  const weights = {
    latency: 0.3,
    bandwidth: 0.3,
    packetLoss: 0.25,
    jitter: 0.15
  };

  // Calculate individual scores (0-100)
  const scores = {
    latency: Math.max(0, 100 - (latency / 2)), // 0ms = 100, 200ms = 0
    bandwidth: Math.min(100, (bandwidth / 1.5)), // 150Mbps = 100
    packetLoss: Math.max(0, 100 - (packetLoss * 10)), // 0% = 100, 10% = 0
    jitter: Math.max(0, 100 - (jitter * 20)) // 0ms = 100, 5ms = 0
  };

  // Calculate weighted average
  const score = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key as keyof typeof scores] * weight);
  }, 0);

  // Determine status based on score
  let status: NetworkStatus = 'excellent';
  if (score < 60) status = 'critical';
  else if (score < 70) status = 'poor';
  else if (score < 80) status = 'fair';
  else if (score < 90) status = 'good';

  // Generate recommendations
  const recommendations: NetworkRecommendation[] = [];
  
  if (latency > 100) {
    recommendations.push({
      type: 'warning',
      title: 'High Latency Detected',
      description: 'Consider checking for network congestion or switching to a closer server.',
      priority: 1
    });
  }

  if (packetLoss > 1) {
    recommendations.push({
      type: 'warning',
      title: 'Packet Loss Detected',
      description: 'Check your network connection and cable quality.',
      priority: 1
    });
  }

  if (bandwidth < 50) {
    recommendations.push({
      type: 'info',
      title: 'Low Bandwidth',
      description: 'Your connection might be throttled or experiencing congestion.',
      priority: 2
    });
  }

  return {
    score: Math.round(score),
    status,
    recommendations
  };
}

export function getNetworkInterfaces(): { name: string; address: string; type: string }[] {
  const interfaces = os.networkInterfaces();
  const result: { name: string; address: string; type: string }[] = [];

  Object.entries(interfaces).forEach(([name, addrs]) => {
    addrs?.forEach(addr => {
      if (addr.family === 'IPv4' && !addr.internal) {
        result.push({
          name,
          address: addr.address,
          type: addr.internal ? 'internal' : 'external'
        });
      }
    });
  });

  return result;
}

export async function monitorNetworkHealth(
  interval: number = 5000,
  callback: (metrics: NetworkMetrics, health: NetworkHealth) => void
): Promise<() => void> {
  let isRunning = true;

  const monitor = async () => {
    while (isRunning) {
      try {
        const metrics = await getNetworkMetrics();
        const health = calculateNetworkHealth(metrics);
        callback(metrics, health);
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error('Error in network monitoring:', error);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  };

  monitor();

  // Return cleanup function
  return () => {
    isRunning = false;
  };
}
