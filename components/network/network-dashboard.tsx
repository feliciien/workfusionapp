"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Network, AlertTriangle, ArrowUp, ArrowDown, Activity, Clock } from "lucide-react";
import { NetworkMetrics } from "@/lib/network-metrics";
import { useState } from "react";
import cn from "classnames";

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
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day");

  const metrics = {
    day: dailyMetrics,
    week: weeklyMetrics,
    month: monthlyMetrics
  }[timeframe];

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-500" };
    if (score >= 70) return { label: "Good", color: "text-blue-500" };
    if (score >= 50) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Poor", color: "text-red-500" };
  };

  const healthStatus = getHealthStatus(metrics.healthScore);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <Activity className={healthStatus.color} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{metrics.healthScore.toFixed(1)}%</div>
              <Badge className={`ml-2 ${healthStatus.color}`}>{healthStatus.label}</Badge>
            </div>
            <Progress 
              value={metrics.healthScore} 
              className={cn(
                "mt-2",
                healthStatus.color === "text-green-500" && "bg-green-100 [&>div]:bg-green-500",
                healthStatus.color === "text-blue-500" && "bg-blue-100 [&>div]:bg-blue-500",
                healthStatus.color === "text-yellow-500" && "bg-yellow-100 [&>div]:bg-yellow-500",
                healthStatus.color === "text-red-500" && "bg-red-100 [&>div]:bg-red-500"
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Last {timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Network className="text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.latency.length > 0
                ? (metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length).toFixed(1)
                : "0"} ms
            </div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <div className="flex space-x-2">
              <ArrowUp className="text-green-500" />
              <ArrowDown className="text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.bandwidth.length > 0
                ? metrics.bandwidth[metrics.bandwidth.length - 1].toFixed(1)
                : "0"} Mbps
            </div>
            <p className="text-xs text-muted-foreground">
              Current usage
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Metrics</CardTitle>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
              <TabsList>
                <TabsTrigger value="day">24h</TabsTrigger>
                <TabsTrigger value="week">7d</TabsTrigger>
                <TabsTrigger value="month">30d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.timestamps.map((time, i) => ({
                  time,
                  latency: metrics.latency[i],
                  bandwidth: metrics.bandwidth[i]
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="latency"
                  stroke="#ff9800"
                  name="Latency (ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bandwidth"
                  stroke="#2196f3"
                  name="Bandwidth (Mbps)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {!isPro && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pro Feature</AlertTitle>
          <AlertDescription>
            Upgrade to Pro to access advanced network monitoring features and historical data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
