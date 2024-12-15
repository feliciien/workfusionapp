"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";

interface AnalysisResult {
  score: number;
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    message: string;
    line?: number;
  }>;
  suggestions: string[];
}

export default function CodeAnalysisPage() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tool = tools.find(t => t.label === "Code Analysis")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setAnalysis(null); // Clear previous results
      
      const response = await api.analyzeCode(code);
      console.log('Analysis response:', response);
      
      if (!response.data) {
        throw new Error("No analysis data received");
      }
      
      setAnalysis(response.data);
      toast.success("Code analysis complete!");
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysis(null);
      toast.error(error.message || "Failed to analyze code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Code to Analyze</label>
            <Textarea
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-64 font-mono"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !code}
          >
            {isLoading ? "Analyzing..." : "Analyze Code"}
          </Button>
        </div>
        
        {analysis && (
          <div className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Analysis Results</h3>
              
              {/* Code Quality Score */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">Code Quality Score</h4>
                <div className="text-4xl font-bold">
                  <span className={analysis.score >= 70 ? 'text-green-500' : analysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                    {analysis.score}
                  </span>
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues && analysis.issues.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-3">Issues Found</h4>
                  <ul className="space-y-3">
                    {analysis.issues.map((issue, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <span className={`font-medium ${getSeverityColor(issue.severity)} uppercase text-xs mt-0.5`}>
                          {issue.severity}
                        </span>
                        <div className="flex-1">
                          <p>{issue.message}</p>
                          {issue.line && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Line {issue.line}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-3">Suggestions for Improvement</h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </ToolPage>
  );
}
