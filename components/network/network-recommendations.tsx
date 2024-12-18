"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetworkHealth } from "@/lib/network-monitor";
import { NetworkMetrics } from "@/lib/network-metrics";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface NetworkRecommendationsProps {
  metrics: NetworkMetrics;
  isPro: boolean;
}

export function NetworkRecommendations({ metrics, isPro }: NetworkRecommendationsProps) {
  const recommendations = generateRecommendations(metrics);
  const healthStatus = getHealthStatus(metrics.healthScore);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Network Health
          <Badge variant={healthStatus.variant}>{healthStatus.label}</Badge>
        </CardTitle>
        <CardDescription>
          AI-powered network analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="text-2xl font-bold">{metrics.healthScore}%</div>
              <p className="text-sm text-muted-foreground">Overall Health Score</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                {rec.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : rec.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Info className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  <p className="font-medium">{rec.title}</p>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>

          {!isPro && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for advanced network analytics and custom recommendations
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function generateRecommendations(metrics: NetworkMetrics) {
  const recommendations: Array<{
    type: 'warning' | 'success' | 'info';
    title: string;
    description: string;
  }> = [];

  // Latency recommendations
  const avgLatency = metrics.latency[metrics.latency.length - 1];
  if (avgLatency > 100) {
    recommendations.push({
      type: 'warning',
      title: 'High Latency Detected',
      description: 'Consider using a wired connection or checking for network congestion.'
    });
  } else if (avgLatency < 50) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Latency',
      description: 'Your network is performing well for real-time applications.'
    });
  }

  // Bandwidth recommendations
  const currentBandwidth = metrics.bandwidth[metrics.bandwidth.length - 1];
  if (currentBandwidth < 25) {
    recommendations.push({
      type: 'warning',
      title: 'Low Bandwidth',
      description: 'Your connection might struggle with high-quality video streaming.'
    });
  } else if (currentBandwidth > 50) {
    recommendations.push({
      type: 'success',
      title: 'Strong Bandwidth',
      description: 'Your connection is suitable for most online activities.'
    });
  }

  // Uptime recommendations
  if (metrics.uptime < 99) {
    recommendations.push({
      type: 'warning',
      title: 'Connection Stability Issues',
      description: 'Your network has experienced some downtime. Consider backup solutions.'
    });
  } else {
    recommendations.push({
      type: 'success',
      title: 'Stable Connection',
      description: 'Your network uptime is excellent.'
    });
  }

  // Add general recommendations
  recommendations.push({
    type: 'info',
    title: 'Network Security',
    description: 'Regularly update your router firmware and use WPA3 encryption when possible.'
  });

  return recommendations;
}

function getHealthStatus(score: number): { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "premium" | null | undefined } {
  if (score >= 80) {
    return { label: 'Excellent', variant: 'default' };
  } else if (score >= 60) {
    return { label: 'Good', variant: 'secondary' };
  } else {
    return { label: 'Needs Attention', variant: 'destructive' };
  }
}
