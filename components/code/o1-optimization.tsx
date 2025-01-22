"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface O1OptimizationProps {
  code: string;
  onOptimizedCode?: (optimizedCode: string) => void;
}

interface O1Response {
  content: string;
}

export function O1Optimization({ code, onOptimizedCode }: O1OptimizationProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<O1Response | null>(null);
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/code/o1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code,
          task: "Analyze and optimize this code for performance, readability, and best practices"
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setResult(data);

      // Extract optimized code from the response and pass it to parent
      const optimizedCode = extractCodeFromResponse(data.content);
      if (optimizedCode && onOptimizedCode) {
        onOptimizedCode(optimizedCode);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to optimize code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractCodeFromResponse = (content: string): string | null => {
    const codeBlockRegex = /\`\`\`(?:\w+\n)?([^`]+)\`\`\`/;
    const match = content.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">O1 Code Optimization</h3>
          </div>
          <Button 
            onClick={handleOptimize} 
            disabled={loading || !code.trim()}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Optimize with O1"
            )}
          </Button>
        </div>

        {result && (
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: result.content
                    .replace(/\n/g, '<br>')
                    .replace(/\`\`\`(\w+)?\n([\s\S]+?)\`\`\`/g, (_, lang, code) => 
                      `<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code class="language-${lang || 'text'}">${code}</code></pre>`
                    )
                }} />
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
