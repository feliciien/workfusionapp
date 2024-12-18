"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkMetrics } from "@/lib/network-metrics";
import { NetworkRecommendations } from "./network-recommendations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Network, Activity, TrendingUp, TrendingDown } from "lucide-react";

interface NetworkDashboardProps {
  dailyMetrics: NetworkMetrics;
  weeklyMetrics: NetworkMetrics;
  monthlyMetrics: NetworkMetrics;
  isPro: boolean;
}

export function NetworkDashboard({
  dailyMetrics,
  weeklyMetrics,
  monthlyMetrics,
  isPro
}: NetworkDashboardProps) {
  const formatData = (metrics: NetworkMetrics) => {
    return metrics.timestamps.map((time, i) => ({
      time,
      latency: metrics.latency[i],
      bandwidth: metrics.bandwidth[i]
    }));
  };

  const renderMetricsCards = (metrics: NetworkMetrics) => {
    const currentLatency = metrics.latency[metrics.latency.length - 1];
    const currentBandwidth = metrics.bandwidth[metrics.bandwidth.length - 1];
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLatency.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              {currentLatency < 50 ? "Excellent" : currentLatency < 100 ? "Good" : "Poor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentBandwidth.toFixed(1)} Mbps</div>
            <p className="text-xs text-muted-foreground">
              {currentBandwidth > 50 ? "High Speed" : currentBandwidth > 25 ? "Good" : "Limited"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(currentBandwidth * 0.2).toFixed(1)} Mbps</div>
            <p className="text-xs text-muted-foreground">Upload Speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Network Availability</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Network Monitor</h2>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {renderMetricsCards(dailyMetrics)}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
                <CardDescription>
                  24-hour network metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={formatData(dailyMetrics)}>
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
            <NetworkRecommendations metrics={dailyMetrics} isPro={isPro} />
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {renderMetricsCards(weeklyMetrics)}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
                <CardDescription>
                  7-day network metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={formatData(weeklyMetrics)}>
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
            <NetworkRecommendations metrics={weeklyMetrics} isPro={isPro} />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {renderMetricsCards(monthlyMetrics)}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
                <CardDescription>
                  30-day network metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={formatData(monthlyMetrics)}>
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
            <NetworkRecommendations metrics={monthlyMetrics} isPro={isPro} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
