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

interface Slide {
  type: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
}

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tool = tools.find(t => t.label === "Presentation Creator")!;

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
      setSlides([]);
      const response = await api.generatePresentation(topic);
      
      console.log("API Response:", response);

      if (!response?.data?.data?.slides || !Array.isArray(response.data.data.slides)) {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server");
      }

      setSlides(response.data.data.slides);
      toast.success("Presentation generated!");
    } catch (error: any) {
      console.error("Presentation error:", error);
      const errorMessage = error.response?.data || error.message || "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleTopics = [
    "Digital Marketing Trends",
    "Climate Change Solutions",
    "Remote Work Best Practices",
    "Artificial Intelligence Basics",
    "Personal Finance Tips",
    "Healthy Lifestyle Habits"
  ];

  const clearForm = () => {
    setTopic("");
    setSlides([]);
    setError(null);
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {exampleTopics.map((exampleTopic) => (
            <Button
              key={exampleTopic}
              variant="outline"
              className="text-sm h-auto whitespace-normal p-2"
              onClick={() => {
                setTopic(exampleTopic);
                setError(null);
              }}
              disabled={isLoading}
            >
              {exampleTopic}
            </Button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Presentation Topic</label>
              <Input
                placeholder="Enter your presentation topic..."
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
                  Generating Presentation...
                </>
              ) : (
                "Generate Presentation"
              )}
            </Button>
          </div>

          {error && (
            <Card className="p-4 border-destructive">
              <div className="text-sm text-destructive">{error}</div>
            </Card>
          )}

          {slides.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Presentation</h3>
              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Slide {index + 1}</h4>
                      <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-secondary rounded">
                        {slide.type}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {slide.title && (
                        <div className="text-lg font-semibold">
                          {slide.title}
                        </div>
                      )}
                      {slide.content && (
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                          {Array.isArray(slide.content) ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {slide.content.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{slide.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const presentationText = slides
                      .map((slide, index) => {
                        const content = Array.isArray(slide.content)
                          ? '• ' + slide.content.join('\n• ')
                          : slide.content;
                        return `Slide ${index + 1} (${slide.type})\n${slide.title}\n\n${content}`;
                      })
                      .join('\n\n---\n\n');
                    navigator.clipboard.writeText(presentationText);
                    toast.success("Presentation copied to clipboard!");
                  }}
                >
                  Copy All Slides
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                >
                  New Presentation
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </ToolPage>
  );
}
