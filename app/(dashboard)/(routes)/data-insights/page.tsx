"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [data, setData] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tool = tools.find(t => t.label === "Analytics Insights")!;

  const exampleData = {
    sales_data: [
      { month: "Jan", revenue: 12000, units: 150 },
      { month: "Feb", revenue: 15000, units: 180 },
      { month: "Mar", revenue: 18000, units: 220 },
      { month: "Apr", revenue: 21000, units: 250 }
    ],
    customer_satisfaction: {
      average_rating: 4.5,
      total_reviews: 500,
      categories: {
        "product_quality": 4.7,
        "customer_service": 4.3,
        "delivery_speed": 4.6
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        toast.error("Please enter valid JSON data");
        setIsLoading(false);
        return;
      }

      const response = await api.analyzeData(parsedData);
      
      if (!response.data?.data) {
        toast.error("Invalid response from server");
        return;
      }

      setInsights(response.data.data);
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Something went wrong");
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Example Data Format:</h3>
          <pre className="text-xs bg-secondary/50 p-2 rounded overflow-auto">
            {JSON.stringify(exampleData, null, 2)}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setData(JSON.stringify(exampleData, null, 2));
              setInsights(null);
            }}
          >
            Use Example Data
          </Button>
        </Card>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data to Analyze (JSON format)</label>
              <Textarea
                placeholder="Paste your JSON data here..."
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-64 font-mono"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !data}
            >
              Generate Insights
            </Button>
          </div>
          {insights && (
            <div className="space-y-4 mt-4">
              {/* Key Metrics */}
              {insights.metrics && Object.keys(insights.metrics).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(insights.metrics).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </h4>
                      <div className="text-2xl font-bold">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trends */}
              {insights.trends && insights.trends.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">Key Trends</h4>
                  <ul className="list-disc pl-4 space-y-2">
                    {insights.trends.map((trend: string, index: number) => (
                      <li key={index} className="text-sm">
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="list-disc pl-4 space-y-2">
                    {insights.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const insightsText = `
Data Analysis Results

Key Metrics:
${Object.entries(insights.metrics || {})
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Key Trends:
${(insights.trends || []).map((trend: string) => `- ${trend}`).join('\n')}

Recommendations:
${(insights.recommendations || []).map((rec: string) => `- ${rec}`).join('\n')}
`;
                    navigator.clipboard.writeText(insightsText.trim());
                    toast.success("Insights copied to clipboard!");
                  }}
                >
                  Copy Insights
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </ToolPage>
  );
}
