"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Code, AlertTriangle, Zap } from "lucide-react";
import { analyzeCode, CodeAnalysis } from '@/lib/code-analyzer';
import { O1Optimization } from './o1-optimization';

interface CodeAnalysisProps {
  onAnalysis?: (analysis: CodeAnalysis) => void;
}

export function CodeAnalysisCard({ onAnalysis }: CodeAnalysisProps) {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState<'paste' | 'file'>('paste');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      setCode(text);
      const result = await analyzeCode(text);
      setAnalysis(result);
      if (onAnalysis) {
        onAnalysis(result);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const result = await analyzeCode(code);
      setAnalysis(result);
      if (onAnalysis) {
        onAnalysis(result);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity.startsWith('Critical')) return 'destructive';
    if (severity.startsWith('High')) return 'destructive';
    if (severity.startsWith('Medium')) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Code Analysis</CardTitle>
        <CardDescription>Analyze your code for quality and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'paste' | 'file')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">
                <Code className="w-4 h-4 mr-2" />
                Paste Code
              </TabsTrigger>
              <TabsTrigger value="file">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste">
              <Textarea
                placeholder="Paste your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-48 font-mono"
              />
            </TabsContent>

            <TabsContent value="file">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".js,.ts,.jsx,.tsx,.vue,.svelte,.html,.css"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JS, TS, JSX, TSX, Vue, Svelte, HTML, CSS
                  </p>
                </label>
              </div>
            </TabsContent>
          </Tabs>
          
          <Button
            onClick={handleAnalyze}
            disabled={loading || !code.trim()}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </Button>

          {analysis && (
            <div className="space-y-6 mt-4">
              {/* Complexity Score */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Complexity Score</span>
                  <span className="text-sm text-muted-foreground">{analysis.complexity}</span>
                </div>
                <Progress 
                  value={Math.min(100, (analysis.complexity / 30) * 100)} 
                  className="h-2"
                />
              </div>

              {/* Performance Score */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="text-sm text-muted-foreground">{analysis.performance.score}%</span>
                </div>
                <Progress value={analysis.performance.score} className="h-2" />
              </div>

              {/* Code Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Lines of Code</span>
                  <p className="mt-1 text-2xl font-bold">{analysis.linesOfCode}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Dependencies</span>
                  <p className="mt-1 text-2xl font-bold">{analysis.dependencies.length}</p>
                </div>
              </div>

              {/* Security Issues */}
              {analysis.securityIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h4 className="text-sm font-medium">Security Issues</h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.securityIssues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant="destructive">Security</Badge>
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Issues */}
              {analysis.performance.issues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <h4 className="text-sm font-medium">Performance Issues</h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.performance.issues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(issue)}>Performance</Badge>
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(suggestion)}>
                          {suggestion.split(':')[0]}
                        </Badge>
                        <span className="text-sm">{suggestion.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <O1Optimization 
          code={code} 
          onOptimizedCode={(optimizedCode) => {
            setCode(optimizedCode);
            handleAnalyze();
          }} 
        />
      </CardFooter>
    </Card>
  );
}
