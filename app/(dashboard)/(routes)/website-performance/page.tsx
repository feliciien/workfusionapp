// Use client-side rendering
"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

import { ToolPage } from "@/components/tool-page";
import { tools, Tool } from "@/app/(dashboard)/(routes)/dashboard/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  analysis: string;
}

const formSchema = z.object({
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

const WebsitePerformancePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const tool: Tool | undefined = tools.find((t) => t.href === "/website-performance");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setAnalysisResult(null);

      const response = await axios.post("/api/website-performance", {
        url: values.url,
      });

      setAnalysisResult(response.data);
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        // Handle subscription or feature limit error
        router.push("/settings");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!tool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>Tool configuration not found</p>
      </div>
    );
  }

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      {/* Form */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="Enter website URL"
              disabled={isLoading}
              {...form.register("url")}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </form>
      </div>

      {/* Results */}
      {analysisResult && (
        <div className="mt-8 space-y-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-full">
              <div className="max-h-[60vh] overflow-y-auto">
                <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolPage>
  );
};

export default WebsitePerformancePage;
