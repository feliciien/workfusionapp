"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetworkMetrics, NetworkHealth } from "@/types/network";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface NetworkRecommendationsProps {
  metrics: NetworkMetrics;
  health: NetworkHealth;
  isPro: boolean;
}

export function NetworkRecommendations({ metrics, health, isPro }: NetworkRecommendationsProps) {
  const healthStatus = getHealthStatus(metrics.healthScore);

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('high') || recommendation.toLowerCase().includes('poor')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (recommendation.toLowerCase().includes('error') || recommendation.toLowerCase().includes('critical')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

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
            {health.recommendations.length > 0 ? (
              health.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {getRecommendationIcon(recommendation)}
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Your network is performing well. No recommendations at this time.
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
