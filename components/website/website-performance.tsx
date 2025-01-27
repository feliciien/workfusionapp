/** @format */

"use client";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProModal } from "@/hooks/use-pro-modal";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface PerformanceMetrics {
  loadingSpeed: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
}

interface WebsiteAnalysisResponse {
  metrics: PerformanceMetrics;
  seoInsights: string[];
  accessibilityIssues: string[];
  performanceRecommendations: string[];
}

export function WebsitePerformance() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<WebsiteAnalysisResponse | null>(
    null
  );
  const proModal = useProModal();

  const analyzeWebsite = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/website-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (response.status === 403) {
        proModal.onOpen();
        return;
      }

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='px-4 lg:px-8'>
      <div className='mb-8 space-y-4'>
        <h2 className='text-2xl md:text-4xl font-bold text-center'>
          Website Performance Analyzer
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          Analyze your website's performance, SEO, and accessibility
        </p>
      </div>

      <div className='space-y-4 mb-4'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Enter website URL'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button onClick={analyzeWebsite} disabled={loading || !url}>
            {loading ? <Loader /> : "Analyze"}
          </Button>
        </div>
      </div>

      {analysis && (
        <Tabs defaultValue='performance' className='space-y-4'>
          <TabsList className='grid grid-cols-3 max-w-[400px]'>
            <TabsTrigger value='performance'>Performance</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
            <TabsTrigger value='accessibility'>Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value='performance' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Score</CardTitle>
                  <CardDescription>Overall performance rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analysis.metrics.performanceScore}/100
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loading Speed</CardTitle>
                  <CardDescription>Time to load the page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analysis.metrics.loadingSpeed.toFixed(2)}s
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time to Interactive</CardTitle>
                  <CardDescription>When users can interact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analysis.metrics.timeToInteractive.toFixed(2)}s
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {analysis.performanceRecommendations.map(
                    (recommendation, index) => (
                      <li key={index} className='text-sm'>
                        • {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='seo' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>SEO Score</CardTitle>
                <CardDescription>
                  Search engine optimization rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold mb-4'>
                  {analysis.metrics.seoScore}/100
                </div>
                <div className='space-y-4'>
                  <h3 className='font-semibold'>Recommendations:</h3>
                  <ul className='space-y-2'>
                    {analysis.seoInsights.map((insight, index) => (
                      <li key={index} className='text-sm'>
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='accessibility' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Score</CardTitle>
                <CardDescription>Web accessibility rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold mb-4'>
                  {analysis.metrics.accessibilityScore}/100
                </div>
                <div className='space-y-4'>
                  <h3 className='font-semibold'>Issues and Recommendations:</h3>
                  <ul className='space-y-2'>
                    {analysis.accessibilityIssues.map((issue, index) => (
                      <li key={index} className='text-sm'>
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
