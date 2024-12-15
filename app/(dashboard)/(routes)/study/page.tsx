"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function StudyPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tool = tools.find(t => t.label === "Study Assistant")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (query.length > 1000) {
      toast.error("Question is too long. Maximum length is 1000 characters");
      return;
    }

    try {
      setIsLoading(true);
      setAnswer("");
      const response = await api.getStudyHelp(query);
      
      if (!response?.data?.answer) {
        throw new Error("Invalid response from server");
      }

      setAnswer(response.data.answer);
      toast.success("Answer generated!");
    } catch (error: any) {
      console.error("Study error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionTopics = [
    "Explain quantum mechanics in simple terms",
    "How does photosynthesis work?",
    "Summarize the key events of the French Revolution",
    "Explain how the human immune system works",
    "What are the fundamental principles of economics?",
    "Explain machine learning for beginners"
  ];

  const clearForm = () => {
    setQuery("");
    setAnswer("");
    setError(null);
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {suggestionTopics.map((topic) => (
            <Button
              key={topic}
              variant="outline"
              className="text-xs md:text-sm text-left h-auto whitespace-normal p-2"
              onClick={() => {
                setQuery(topic);
                setError(null);
              }}
              disabled={isLoading}
            >
              {topic}
            </Button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What would you like to learn about?</label>
              <Textarea
                placeholder="Ask any question or topic you'd like to understand better..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError(null);
                }}
                className="h-32 resize-none"
                disabled={isLoading}
              />
              {query && (
                <div className="text-xs text-muted-foreground">
                  {query.length}/1000 characters
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Answer...
                </>
              ) : (
                "Get Answer"
              )}
            </Button>
          </div>

          {error && (
            <Card className="p-4 border-destructive">
              <div className="text-sm text-destructive">{error}</div>
            </Card>
          )}

          {answer && (
            <Card className="p-6 space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Answer:</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(answer);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Answer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearForm}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Question
                </Button>
              </div>
            </Card>
          )}
        </form>
      </div>
    </ToolPage>
  );
}
