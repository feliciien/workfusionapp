"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCode, CodeAnalysis } from '@/lib/code-analyzer';
import { Code, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
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
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Code Analysis</CardTitle>
        <CardDescription>
          Analyze your code for quality and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Tabs
            value={inputMethod}
            onValueChange={(v) => setInputMethod(v as "paste" | "file")}
            className='w-full'>
            <TabsList className='grid w-full grid-cols-2 mb-4'>
              <TabsTrigger
                value='paste'
                className='flex items-center gap-2 transition-all'>
                <Code className='w-4 h-4' />
                Paste Code
              </TabsTrigger>
              <TabsTrigger
                value='file'
                className='flex items-center gap-2 transition-all'>
                <Upload className='w-4 h-4' />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value='paste' className='mt-4'>
              <div className='relative'>
                <Textarea
                  placeholder='Paste your code here...'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className='h-48 font-mono resize-none focus:ring-2 focus:ring-primary/50 transition-all'
                />
                {code && (
                  <button
                    onClick={() => setCode("")}
                    className='absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                    title='Clear code'>
                    <X className='w-4 h-4' />
                  </button>
                )}
              </div>
            </TabsContent>

            <TabsContent value='file' className='mt-4'>
              <div className='border-2 border-dashed rounded-lg p-8 text-center transition-all hover:border-primary/50 cursor-pointer'>
                <input
                  type='file'
                  accept='.js,.ts,.jsx,.tsx,.vue,.svelte,.html,.css'
                  onChange={handleFileUpload}
                  className='hidden'
                  id='file-upload'
                />
                <label
                  htmlFor='file-upload'
                  className='cursor-pointer space-y-2 block'>
                  <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground transition-colors group-hover:text-primary' />
                  <p className='text-lg font-medium text-muted-foreground'>
                    Click to upload or drag and drop
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Supports JS, TS, JSX, TSX, Vue, Svelte, HTML, CSS
                  </p>
                </label>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleAnalyze}
            disabled={loading || !code.trim()}
            className='w-full relative overflow-hidden group'>
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <Code className='w-4 h-4' />
                <span>Analyze Code</span>
              </div>
            )}
            {!loading && (
              <div className='absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300' />
            )}
          </Button>
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
