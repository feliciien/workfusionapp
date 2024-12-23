"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DataInsightsResponse {
  metrics: Record<string, number | string>;
  trends: string[];
  recommendations: string[];
}

export default function DataInsightsPage() {
  const [data, setData] = useState("");
  const [insights, setInsights] = useState<DataInsightsResponse | null>(null);
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

  const validateJSON = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setInsights(null);

    try {
      if (!validateJSON(data)) {
        toast.error("Please enter valid JSON data");
        return;
      }

      const parsedData = JSON.parse(data);
      const response = await api.analyzeData(parsedData);
      
      if (!response.data) {
        throw new Error("Failed to get analysis response from server");
      }

      setInsights(response.data);
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze data. Please try again.");
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Example Data Format</h3>
          <pre className="text-sm bg-secondary/50 p-4 rounded-lg overflow-auto">
            {JSON.stringify(exampleData, null, 2)}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setData(JSON.stringify(exampleData, null, 2));
              setInsights(null);
            }}
          >
            Use Example Data
          </Button>
        </Card>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Data to Analyze (JSON format)
              </label>
              <Textarea
                placeholder="Paste your JSON data here..."
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-64 font-mono text-sm"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !data}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate Insights"
              )}
            </Button>
          </div>

          {insights && (
            <div className="space-y-6">
              {/* Key Metrics */}
              {insights.metrics && Object.keys(insights.metrics).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(insights.metrics).map(([key, value]) => (
                      <div key={key} className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-sm text-muted-foreground mb-1">
                          {key.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </h4>
                        <div className="text-2xl font-bold">
                          {typeof value === 'number' 
                            ? value.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                              })
                            : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Trends */}
              {insights.trends && insights.trends.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Key Trends</h3>
                  <ul className="space-y-3">
                    {insights.trends.map((trend, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="text-blue-500">•</span>
                        {trend}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="text-green-500">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const insightsText = `
Data Analysis Results

Key Metrics:
${Object.entries(insights.metrics)
  .map(([key, value]) => `• ${key.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')}: ${value}`)
  .join('\n')}

Key Trends:
${insights.trends.map(trend => `• ${trend}`).join('\n')}

Recommendations:
${insights.recommendations.map(rec => `• ${rec}`).join('\n')}
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
