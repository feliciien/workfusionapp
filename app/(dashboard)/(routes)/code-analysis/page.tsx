"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";

export default function CodeAnalysisPage() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tool = tools.find(t => t.label === "Code Analysis")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.analyzeCode(code);
      setAnalysis(response.data.data);
      toast.success("Code analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
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
            Analyze Code
          </Button>
        </div>
        {analysis && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Analysis Results</h3>
              
              {/* Code Quality Score */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">Code Quality Score</h4>
                <div className="text-2xl font-bold text-primary">
                  {analysis.score}/100
                </div>
              </div>

              {/* Issues */}
              {analysis.issues?.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">Issues Found</h4>
                  <ul className="list-disc pl-4 space-y-2">
                    {analysis.issues.map((issue: any, index: number) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{issue.severity}: </span>
                        {issue.message}
                        {issue.line && (
                          <span className="text-muted-foreground"> (Line {issue.line})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">Suggestions for Improvement</h4>
                  <ul className="list-disc pl-4 space-y-2">
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-sm">
                        {suggestion}
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
