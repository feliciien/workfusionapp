"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";

export default function ContentPage() {
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tool = tools.find(t => t.label === "Content Writer")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.generateContent(prompt);
      setContent(response.data.content);
      toast.success("Content generated successfully!");
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
            <label className="text-sm font-medium">What would you like to write about?</label>
            <Textarea
              placeholder="E.g., Write a blog post about the benefits of meditation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !prompt}
          >
            Generate Content
          </Button>
        </div>
        {content && (
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Generated Content:</label>
            <div className="p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap">
              {content}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success("Copied to clipboard!");
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        )}
      </form>
    </ToolPage>
  );
}
