/** @format */

"use client";

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
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  mobileResponsiveness: number;
  crossBrowserScore: number;
  timestamp: string;
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
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>(
    []
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
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
      <div className='mb-8 space-y-4 animate-fade-in'>
        <h2 className='text-2xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60'>
          Website Performance Analyzer
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          Analyze your website's performance, SEO, and accessibility
        </p>
      </div>

      <div className='space-y-4 mb-4'>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Input
              placeholder='Enter website URL'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className='pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/50'
            />
            {url && (
              <button
                onClick={() => setUrl("")}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'>
                <X className='w-4 h-4 text-muted-foreground' />
              </button>
            )}
          </div>
          <Button
            onClick={analyzeWebsite}
            disabled={loading || !url}
            className='relative overflow-hidden group min-w-[100px]'>
            {loading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                <span>Analyzing</span>
              </div>
            ) : (
              <span>Analyze</span>
            )}
            {!loading && (
              <div className='absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300' />
            )}
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
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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

              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                  <CardDescription>Key user experience metrics</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div>
                    <span className='text-sm text-muted-foreground'>LCP: </span>
                    <span className='font-medium'>
                      {analysis.metrics.largestContentfulPaint.toFixed(2)}s
                    </span>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>CLS: </span>
                    <span className='font-medium'>
                      {analysis.metrics.cumulativeLayoutShift.toFixed(3)}
                    </span>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>FID: </span>
                    <span className='font-medium'>
                      {analysis.metrics.firstInputDelay.toFixed(0)}ms
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Cross-Browser Compatibility</CardTitle>
                  <CardDescription>
                    Performance across different browsers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='text-2xl font-bold mb-2'>
                      {analysis.metrics.crossBrowserScore}/100
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Your website performs well across major browsers
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile Responsiveness</CardTitle>
                  <CardDescription>Mobile-friendly assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='text-2xl font-bold mb-2'>
                      {analysis.metrics.mobileResponsiveness}/100
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Mobile optimization score based on responsive design
                      principles
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analysis.performanceRecommendations.map(
                    (recommendation, index) => (
                      <div key={index} className='p-4 bg-muted/50 rounded-lg'>
                        <p className='text-sm'>{recommendation}</p>
                      </div>
                    )
                  )}
                </div>
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
                  <div className='space-y-3'>
                    {analysis.seoInsights.map((insight, index) => (
                      <div key={index} className='p-4 bg-muted/50 rounded-lg'>
                        <p className='text-sm'>{insight}</p>
                      </div>
                    ))}
                  </div>
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
                  <div className='space-y-3'>
                    {analysis.accessibilityIssues.map((issue, index) => (
                      <div key={index} className='p-4 bg-muted/50 rounded-lg'>
                        <p className='text-sm'>{issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
