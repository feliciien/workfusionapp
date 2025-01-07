"use client";

import { useState, useEffect } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Copy, 
  RefreshCw, 
  FileDown,
  Layout,
  LayoutTemplate,
  Presentation
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import Script from 'next/script';

// Define the PptxGenJS type from the CDN
declare global {
  interface Window {
    PptxGenJS: any;
  }
}

interface Slide {
  type?: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string[];
  notes?: string;
}

// Templates for different presentation styles
const PRESENTATION_TEMPLATES = [
  { id: 'business', name: 'Business Presentation', description: 'Professional and formal style' },
  { id: 'educational', name: 'Educational', description: 'Clear and instructive format' },
  { id: 'creative', name: 'Creative', description: 'Dynamic and engaging style' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple design' }
] as const;

type Template = typeof PRESENTATION_TEMPLATES[number]['id'];

export default function PresentationPage() {
  // Tool loading state
  const [isLoadingTool, setIsLoadingTool] = useState(true);
  const [tool, setTool] = useState(tools.find(t => t.href === "/presentation"));

  // Form states
  const [topic, setTopic] = useState("");
  const [template, setTemplate] = useState<Template>('business');
  
  // Presentation states
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Loading and progress states
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize tool
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingTool(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoadingTool) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading presentation tool...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Configuration Error</h2>
        <p className="mt-2 text-muted-foreground">Unable to load presentation tool configuration.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }

    try {
      setIsLoading(true);
      setSlides([]);
      setCurrentSlide(0);

      // Simulate progress while generating
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(95, prev + 5));
      }, 500);

      const response = await api.generatePresentation(topic, template);
      clearInterval(progressInterval);
      setProgress(100);

      if (!response.data?.slides) {
        throw new Error("Invalid response from server");
      }

      // Transform API response to match our Slide interface
      const transformedSlides: Slide[] = response.data.slides.map((apiSlide) => ({
        type: apiSlide.type,
        title: apiSlide.title,
        content: Array.isArray(apiSlide.content) ? apiSlide.content : [apiSlide.content],
        notes: apiSlide.notes
      }));

      setSlides(transformedSlides);
      toast.success("Presentation generated successfully!");
    } catch (error) {
      console.error("Error generating presentation:", error);
      toast.error("Failed to generate presentation");
      setError("Failed to generate presentation. Please try again.");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const exampleTopics = [
    "Digital Marketing Trends 2024",
    "Climate Change Solutions",
    "Remote Work Best Practices",
    "AI in Healthcare",
    "Personal Finance Essentials",
    "Effective Leadership Skills"
  ];

  const clearForm = () => {
    setTopic("");
    setSlides([]);
    setError(null);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleDownload = async () => {
    if (!slides || slides.length === 0) {
      toast.error("No slides to download");
      return;
    }

    try {
      setIsDownloading(true);
      
      // Use the CDN version
      const pres = new window.PptxGenJS();

      // Add slides
      slides.forEach((slide) => {
        const pptSlide = pres.addSlide();
        
        // Add title
        pptSlide.addText(slide.title, { 
          x: 1, 
          y: 0.5, 
          w: '80%',
          fontSize: 24,
          bold: true,
          color: '363636'
        });

        // Add content
        if (Array.isArray(slide.content)) {
          slide.content.forEach((point, idx) => {
            pptSlide.addText(point, {
              x: 1,
              y: 1.5 + (idx * 0.5),
              w: '80%',
              fontSize: 18,
              bullet: true
            });
          });
        }

        // Add notes if present
        if (slide.notes) {
          pptSlide.addNotes(slide.notes);
        }
      });

      // Save the presentation
      await pres.writeFile({ fileName: "presentation.pptx" });
      toast.success("Presentation downloaded successfully!");
    } catch (error) {
      console.error("Error downloading presentation:", error);
      toast.error("Failed to download presentation");
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (!slides.length) return;

    const presentationText = slides
      .map(slide => 
        `${slide.title}\n\n${
          Array.isArray(slide.content)
            ? slide.content.join('\n')
            : slide.content
        }`
      )
      .join('\n\n---\n\n');
    
    navigator.clipboard.writeText(presentationText);
    toast.success('Copied to clipboard!');
  };

  return (
    <ToolPage
      tool={tool}
      isLoading={isLoading}
      error={error}
    >
      <Script 
        src="https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgen.min.js" 
        strategy="beforeInteractive"
      />
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="flex-1">
            <Input
              placeholder="Enter your presentation topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <Select
            value={template}
            onValueChange={(value: Template) => setTemplate(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {PRESENTATION_TEMPLATES.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center">
                    <LayoutTemplate className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Presentation className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
        {isLoading && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">Generating your presentation...</p>
          </div>
        )}
      </form>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {slides.length > 0 && (
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="slides"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Generated Slides</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 py-1">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                    disabled={currentSlide === slides.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h3 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {slides[currentSlide].content.map((point, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-lg"
                      >
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                  {slides[currentSlide].notes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">{slides[currentSlide].notes}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {slides.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide(0)}
              disabled={currentSlide === 0}
            >
              First Slide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide(slides.length - 1)}
              disabled={currentSlide === slides.length - 1}
            >
              Last Slide
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PPTX
                </>
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearForm}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            New Presentation
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
