"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function IdeasPage() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tool = tools.find(t => t.label === "Idea Generator")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (topic.length > 1000) {
      toast.error("Topic is too long. Maximum length is 1000 characters");
      return;
    }

    try {
      setIsLoading(true);
      setIdeas([]);
      const response = await api.generateIdeas(topic);
      
      console.log("API Response:", response);

      if (!response?.data?.data?.ideas || !Array.isArray(response.data.data.ideas)) {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server");
      }

      setIdeas(response.data.data.ideas);
      toast.success("Ideas generated!");
    } catch (error: any) {
      console.error("Ideas error:", error);
      const errorMessage = error.response?.data || error.message || "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Business Ideas",
    "Creative Projects",
    "Blog Topics",
    "Product Innovation",
    "Social Media Content",
    "Event Planning"
  ];

  const clearForm = () => {
    setTopic("");
    setIdeas([]);
    setError(null);
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="text-sm h-auto whitespace-normal p-2"
              onClick={() => {
                setTopic(category);
                setError(null);
              }}
              disabled={isLoading}
            >
              {category}
            </Button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What kind of ideas are you looking for?</label>
              <Input
                placeholder="Enter a topic or category..."
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
              />
              {topic && (
                <div className="text-xs text-muted-foreground">
                  {topic.length}/1000 characters
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !topic.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                "Generate Ideas"
              )}
            </Button>
          </div>

          {error && (
            <Card className="p-4 border-destructive">
              <div className="text-sm text-destructive">{error}</div>
            </Card>
          )}

          {ideas.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-4">Generated Ideas:</h3>
              <div className="space-y-3">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-3 bg-secondary/50 rounded-lg flex items-start space-x-3"
                  >
                    <span className="text-primary font-medium">
                      {index + 1}.
                    </span>
                    <p className="text-sm flex-1">{idea}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const ideasText = ideas
                      .map((idea, index) => `${index + 1}. ${idea}`)
                      .join('\n');
                    navigator.clipboard.writeText(ideasText);
                    toast.success("Ideas copied to clipboard!");
                  }}
                >
                  Copy Ideas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                >
                  New Topic
                </Button>
              </div>
            </Card>
          )}
        </form>
      </div>
    </ToolPage>
  );
}
