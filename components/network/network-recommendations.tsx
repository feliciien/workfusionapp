"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetworkHealth, NetworkMetrics, NetworkRecommendation } from "@/types/network";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface NetworkRecommendationsProps {
  metrics: NetworkMetrics;
  health?: NetworkHealth;
  isPro: boolean;
}

export function NetworkRecommendations({ metrics, health, isPro }: NetworkRecommendationsProps) {
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
            {health?.recommendations?.map((rec, index) => (
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
            
            {!health?.recommendations?.length && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No recommendations at this time. Your network is performing well.
                </p>
              </div>
            )}
            
            {!isPro && (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for more detailed network analysis and recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getHealthStatus(score: number): { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "premium" | null | undefined } {
  if (score >= 90) return { label: "Excellent", variant: "premium" };
  if (score >= 80) return { label: "Good", variant: "default" };
  if (score >= 70) return { label: "Fair", variant: "secondary" };
  if (score >= 60) return { label: "Poor", variant: "outline" };
  return { label: "Critical", variant: "destructive" };
}
