"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Analytics {
  id: string;
  eventType: string;
  eventData: Record<string, any>;
  createdAt: string;
}

interface ErrorEvent {
  id: string;
  createdAt: string;
  message: string;
  code: string;
}

interface AnalyticsDashboardProps {
  analytics: Analytics[];
  apiUsage: Record<string, number>;
  errors: ErrorEvent[];
}

export function AnalyticsDashboard({
  analytics,
  apiUsage,
  errors,
}: AnalyticsDashboardProps) {
  const totalApiCalls = Object.values(apiUsage).reduce((a, b) => a + b, 0);
  const errorRate = totalApiCalls > 0 ? ((errors.length / totalApiCalls) * 100) : 0;

  const apiUsageData = Object.entries(apiUsage)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="api-usage">API Usage</TabsTrigger>
        <TabsTrigger value="errors">Errors</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total API Calls</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {totalApiCalls.toLocaleString()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {errorRate.toFixed(2)}%
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Days</CardTitle>
              <CardDescription>Days with API usage</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {Object.keys(apiUsage).length}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="api-usage">
        <Card>
          <CardHeader>
            <CardTitle>API Usage Over Time</CardTitle>
            <CardDescription>Number of API calls per day</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), "API Calls"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="errors">
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errors.length === 0 ? (
                <p className="text-muted-foreground">No errors in the last 7 days!</p>
              ) : (
                errors.map((error) => (
                  <Alert key={error.id} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error on {new Date(error.createdAt).toLocaleDateString()}</AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="font-semibold">{error.code}</div>
                      <div className="text-sm mt-1">{error.message}</div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
