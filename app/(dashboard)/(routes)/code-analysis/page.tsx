"use client";

import { useState } from "react";
import { Heading } from "@/components/heading";
import { CodeAnalysisCard } from "@/components/code/code-analysis";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeAnalysis } from "@/lib/code-analyzer";
import { FileIcon, CodeIcon, BarChartIcon } from "lucide-react";

export default function CodeAnalysisPage() {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);

  return (
    <div>
      <Heading
        title="Code Analysis"
        description="Analyze your code for quality, security, and performance issues."
        icon={CodeIcon}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />

      <div className="px-4 lg:px-8">
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">
              <CodeIcon className="w-4 h-4 mr-2" />
              Analyze Code
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChartIcon className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-4">
            <CodeAnalysisCard onAnalysis={setAnalysis} />
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            {analysis ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Complexity Score</h3>
                  <p className="text-3xl font-bold mt-2">{analysis.complexity}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Performance Score</h3>
                  <p className="text-3xl font-bold mt-2">{analysis.performance.score}%</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Lines of Code</h3>
                  <p className="text-3xl font-bold mt-2">{analysis.linesOfCode}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Dependencies</h3>
                  <p className="text-3xl font-bold mt-2">{analysis.dependencies.length}</p>
                </Card>
              </div>
            ) : (
              <Card className="p-4">
                <p className="text-center text-muted-foreground">
                  Analyze some code to see metrics
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
