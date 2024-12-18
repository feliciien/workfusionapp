import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export interface NetworkMetrics {
  downloadSpeed: number;  // in Mbps
  uploadSpeed: number;    // in Mbps
  latency: number;       // in ms
  jitter: number;        // in ms
  packetLoss: number;    // in percentage
  timestamp: Date;
}

export interface NetworkHealth {
  score: number;         // 0-100
  status: 'good' | 'fair' | 'poor';
  recommendations: string[];
}

async function pingHost(host: string): Promise<{ latency: number; packetLoss: number }> {
  try {
    const count = 5;
    const { stdout } = await execAsync(`ping -c ${count} ${host}`);
    
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

async function measureBandwidth(): Promise<{ download: number; upload: number }> {
  try {
    // Simulate bandwidth test (replace with actual speed test implementation)
    const downloadSpeed = Math.random() * 100 + 50; // 50-150 Mbps
    const uploadSpeed = Math.random() * 50 + 25;    // 25-75 Mbps
    
    return {
      download: parseFloat(downloadSpeed.toFixed(2)),
      upload: parseFloat(uploadSpeed.toFixed(2))
    };
  } catch (error) {
    console.error('Error measuring bandwidth:', error);
    return { download: 0, upload: 0 };
  }
}

export async function getNetworkMetrics(testHost: string = '8.8.8.8'): Promise<NetworkMetrics> {
  const [pingResults, bandwidthResults] = await Promise.all([
    pingHost(testHost),
    measureBandwidth()
  ]);

  return {
    downloadSpeed: bandwidthResults.download,
    uploadSpeed: bandwidthResults.upload,
    latency: pingResults.latency,
    jitter: Math.random() * 5, // Simulated jitter
    packetLoss: pingResults.packetLoss,
    timestamp: new Date()
  };
}

export function calculateNetworkHealth(metrics: NetworkMetrics): NetworkHealth {
  const weights = {
    downloadSpeed: 0.25,
    uploadSpeed: 0.25,
    latency: 0.2,
    jitter: 0.15,
    packetLoss: 0.15
  };

  // Normalize metrics to 0-100 scale
  const downloadScore = Math.min(100, (metrics.downloadSpeed / 100) * 100);
  const uploadScore = Math.min(100, (metrics.uploadSpeed / 50) * 100);
  const latencyScore = Math.max(0, 100 - (metrics.latency / 100) * 100);
  const jitterScore = Math.max(0, 100 - (metrics.jitter / 10) * 100);
  const packetLossScore = Math.max(0, 100 - metrics.packetLoss * 10);

  const score = Math.round(
    downloadScore * weights.downloadSpeed +
    uploadScore * weights.uploadSpeed +
    latencyScore * weights.latency +
    jitterScore * weights.jitter +
    packetLossScore * weights.packetLoss
  );

  const recommendations: string[] = [];
  
  if (metrics.downloadSpeed < 50) {
    recommendations.push("Consider upgrading your internet plan for better download speeds");
  }
  if (metrics.uploadSpeed < 25) {
    recommendations.push("Upload speed is below recommended levels for video conferencing");
  }
  if (metrics.latency > 50) {
    recommendations.push("High latency detected. Check for network congestion or try a wired connection");
  }
  if (metrics.packetLoss > 1) {
    recommendations.push("Packet loss detected. This may indicate network reliability issues");
  }

  return {
    score,
    status: score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor',
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
