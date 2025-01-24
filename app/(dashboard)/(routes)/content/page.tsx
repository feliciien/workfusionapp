"use client";

import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import { Loader2, Copy, RefreshCw, Type, Wand2, Sparkles, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const convertMarkdownToPlainText = (markdownText: string): string => {
  return markdownText
    .replace(/(\*\*|\*|__|_|~~|`|#)/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1');
};

const contentTypes = [
  { value: "blog", label: "Blog Post", icon: Type },
  { value: "article", label: "Article", icon: Type },
  { value: "social", label: "Social Media Post", icon: Sparkles },
  { value: "email", label: "Email Copy", icon: Type },
  { value: "marketing", label: "Marketing Copy", icon: Wand2 },
];

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "persuasive", label: "Persuasive" },
];

export default function ContentPage() {
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("blog");
  const [tone, setTone] = useState("professional");
  const [activeTab, setActiveTab] = useState<string>("write");

  const tool = tools.find(t => t.label === "Content Writer")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter what you'd like to write about");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.generateContent(prompt, type, tone);
      if (!response.success || !response.data?.content) {
        throw new Error(response.error || "Failed to generate content");
      }
      setContent(response.data.content);
      setActiveTab("preview");
      toast.success("Content generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const plainTextContent = convertMarkdownToPlainText(content);
    navigator.clipboard.writeText(plainTextContent);
    toast.success("Copied to clipboard!");
  };

  const regenerateContent = () => {
    if (prompt) {
      onSubmit(new Event("submit") as any);
    }
  };

  const shareOnLinkedIn = () => {
    const plainTextContent = convertMarkdownToPlainText(content);
    navigator.clipboard.writeText(plainTextContent);
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=`;
    window.open(url, "_blank");
    toast.success("Content copied to clipboard! Paste it into your LinkedIn post.");
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="max-w-5xl mx-auto">
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-b from-background to-muted/20">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Content Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {contentTypes.map((contentType) => {
                    const Icon = contentType.icon;
                    return (
                      <button
                        key={contentType.value}
                        type="button"
                        onClick={() => setType(contentType.value)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                          "hover:border-primary/50 hover:bg-primary/5",
                          type === contentType.value
                            ? "border-primary/70 bg-primary/10"
                            : "border-transparent bg-card"
                        )}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{contentType.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Writing Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {toneOptions.map((toneOption) => (
                    <button
                      key={toneOption.value}
                      type="button"
                      onClick={() => setTone(toneOption.value)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-center",
                        "hover:border-primary/50 hover:bg-primary/5",
                        tone === toneOption.value
                          ? "border-primary/70 bg-primary/10"
                          : "border-transparent bg-card"
                      )}
                    >
                      <span className="text-xs font-medium">{toneOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">What would you like to write about?</label>
              <Textarea
                placeholder="E.g., Write a blog post about the benefits of meditation..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32 resize-none bg-card"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {content && (
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="write">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateContent}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareOnLinkedIn}
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              <Card className="overflow-hidden border-0 shadow-lg">
                <TabsContent value="write" className="m-0">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[500px] p-4 rounded-none border-0 resize-none bg-card font-mono text-sm"
                  />
                </TabsContent>
                <TabsContent value="preview" className="m-0">
                  <div className="p-8 min-h-[500px] prose prose-sm dark:prose-invert max-w-none bg-card">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                </TabsContent>
              </Card>
            </Tabs>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
