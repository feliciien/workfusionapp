"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";
import { Progress } from "@/components/ui/progress";

const DocumentPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    keyPoints: string[];
    sentiment: string;
    wordCount: number;
    readingTime: number;
  } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setFile(e.target.files[0]);
  };

  const handleAnalysis = async () => {
    if (!file) return;

    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          proModal.onOpen();
        }
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Document Analysis"
        description="Upload and analyze documents to extract insights."
        icon={FileText}
        iconColor="text-yellow-700"
        bgColor="bg-yellow-700/10"
      />
      <div className="px-4 lg:px-8">
        <div className="space-y-4">
          <Card className="p-6 border-dashed border-2 hover:border-yellow-500 transition cursor-pointer">
            <input
              type="file"
              onChange={handleUpload}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
            >
              <Upload className="h-10 w-10 text-yellow-500" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX, and TXT files
              </p>
            </label>
          </Card>
          {file && (
            <Button
              onClick={handleAnalysis}
              disabled={analyzing}
              className="w-full"
            >
              Analyze Document
            </Button>
          )}
          {analyzing && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {!analyzing && !result && !file && (
            <Empty label="Upload a document to begin analysis" />
          )}
          {result && (
            <Card className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Document Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.summary}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Key Points</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Word Count</h4>
                    <p className="text-2xl font-bold">{result.wordCount}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Reading Time</h4>
                    <p className="text-2xl font-bold">{result.readingTime} min</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Sentiment</h4>
                    <p className="text-2xl font-bold capitalize">{result.sentiment}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
