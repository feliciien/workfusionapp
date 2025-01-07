"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NetworkMetrics, NetworkStatus, NetworkHealth } from "@/types/network";
import { NetworkRecommendations } from "./network-recommendations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Network, Activity, TrendingUp, Wifi } from "lucide-react";

interface NetworkDashboardProps {
  metrics: NetworkMetrics;
  health: NetworkHealth;
  isPro: boolean;
}

export function NetworkDashboard({ metrics, health, isPro }: NetworkDashboardProps) {
  const getLatestValue = (arr: { value: number; timestamp: Date }[]) => 
    arr[arr.length - 1]?.value ?? 0;

  const formatData = (metrics: NetworkMetrics) => {
    // Combine all metrics into a single timeline
    const timePoints = new Set<string>();
    [...metrics.latency, ...metrics.bandwidth, ...metrics.packetLoss].forEach(m => 
      timePoints.add(new Date(m.timestamp).toISOString())
    );

    return Array.from(timePoints).sort().map(time => {
      const point = new Date(time);
      return {
        time: point.toLocaleTimeString(),
        latency: metrics.latency.find(m => new Date(m.timestamp).getTime() === point.getTime())?.value ?? null,
        bandwidth: metrics.bandwidth.find(m => new Date(m.timestamp).getTime() === point.getTime())?.value ?? null,
        packetLoss: metrics.packetLoss.find(m => new Date(m.timestamp).getTime() === point.getTime())?.value ?? null,
      };
    });
  };

  const getStatusColor = (status: NetworkStatus) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const currentLatency = getLatestValue(metrics.latency);
  const currentBandwidth = getLatestValue(metrics.bandwidth);
  const currentPacketLoss = getLatestValue(metrics.packetLoss);
  
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLatency.toFixed(1)}ms</div>
            <p className={`text-xs ${getStatusColor(metrics.status)}`}>
              {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentBandwidth.toFixed(1)} Mbps</div>
            <p className="text-xs text-muted-foreground">
              {currentBandwidth > 100 ? "High Speed" : currentBandwidth > 50 ? "Good" : "Limited"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packet Loss</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPacketLoss.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {currentPacketLoss < 0.1 ? "Excellent" : currentPacketLoss < 1 ? "Good" : "Poor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.healthScore}%</div>
            <p className={`text-xs ${getStatusColor(metrics.status)}`}>
              {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Network Performance</CardTitle>
            <CardDescription>
              Real-time monitoring of key metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatData(metrics)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#8884d8" name="Latency (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="bandwidth" stroke="#82ca9d" name="Bandwidth (Mbps)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <NetworkRecommendations metrics={metrics} health={health} isPro={isPro} />
      </div>
    </div>
  );
}
