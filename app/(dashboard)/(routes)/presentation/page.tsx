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
import { Slide } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Templates for different presentation styles
const PRESENTATION_TEMPLATES = [
  { id: 'business', name: 'Business Presentation', description: 'Professional and formal style' },
  { id: 'educational', name: 'Educational', description: 'Clear and instructional format' },
  { id: 'creative', name: 'Creative', description: 'Dynamic and engaging style' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple design' },
];

export default function PresentationPage() {
  // Tool loading state
  const [isLoadingTool, setIsLoadingTool] = useState(true);
  const [tool, setTool] = useState(tools.find(t => t.href === "/presentation"));

  // Form states
  const [topic, setTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState('business');
  
  // Presentation states
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  
  // Loading and progress states
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize tool
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingTool(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update current slide
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex < slides.length) {
      setCurrentSlide(slides[currentSlideIndex]);
    } else {
      setCurrentSlide(null);
    }
  }, [slides, currentSlideIndex]);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setProgress(0);
    
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
      setCurrentSlideIndex(0);

      // Simulate progress while generating
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await api.generatePresentation(topic, selectedTemplate);

      clearInterval(progressInterval);
      setProgress(100);

      if (!response?.data) {
        throw new Error('Failed to generate presentation');
      }

      if (!response.data.slides || response.data.slides.length === 0) {
        throw new Error('No slides generated. Please try again.');
      }

      setSlides(response.data.slides);
      toast.success("Presentation generated successfully!");
    } catch (err: any) {
      console.error("Error generating presentation:", err);
      toast.error(err.message || "Failed to generate presentation");
      setError(err.message || "Failed to generate presentation");
    } finally {
      setIsLoading(false);
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
    setCurrentSlideIndex(0);
    setCurrentSlide(null);
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const generatePowerPoint = async () => {
    if (!slides.length) return;

    try {
      // Dynamically import pptxgenjs only when needed
      const pptxgen = await import('pptxgenjs');
      const PptxGenJS = pptxgen.default;

      const pres = new PptxGenJS();

      // Set presentation properties
      pres.author = 'WorkFusion';
      pres.company = 'WorkFusion';
      pres.revision = '1';
      pres.subject = topic;
      pres.title = topic;

      // Add slides
      slides.forEach((slide) => {
        const pptSlide = pres.addSlide();

        // Add title to all slides
        pptSlide.addText(slide.title, {
          x: '5%',
          y: '5%',
          w: '90%',
          h: '15%',
          fontSize: slide.type === 'title' ? 44 : 32,
          bold: true,
          align: 'center',
          color: '363636',
        });

        // Add content based on slide type
        if (typeof slide.content === 'string') {
          // Title slide subtitle
          pptSlide.addText(slide.content, {
            x: '10%',
            y: '30%',
            w: '80%',
            h: '40%',
            fontSize: 28,
            align: 'center',
            color: '666666',
          });
        } else {
          // Bullet points for other slides
          const bulletPoints = slide.content.map(point => ({ text: point }));
          pptSlide.addText(bulletPoints, {
            x: '10%',
            y: '25%',
            w: '80%',
            h: '70%',
            fontSize: 24,
            bullet: { type: 'bullet' },
            color: '363636',
            lineSpacing: 32,
          });
        }

        // Add slide number except for title slide
        if (slide.type !== 'title') {
          pptSlide.addText(`${slides.indexOf(slide)}/${slides.length - 1}`, {
            x: '90%',
            y: '95%',
            w: '10%',
            h: '5%',
            fontSize: 12,
            color: '666666',
            align: 'right',
          });
        }
      });

      // Save the presentation
      const fileName = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
      await pres.writeFile({ fileName });
      toast.success("PowerPoint presentation downloaded!");
    } catch (error) {
      console.error("Error generating PowerPoint:", error);
      toast.error("Failed to generate PowerPoint presentation");
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
      <form onSubmit={onSubmit} className="w-full">
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
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
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

      {currentSlide && (
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 min-h-[400px] relative">
                <div className="absolute top-4 right-4 text-sm text-gray-500">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">{currentSlide.title}</h2>
                  {Array.isArray(currentSlide.content) ? (
                    <ul className="space-y-2 list-disc pl-6">
                      {currentSlide.content.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{currentSlide.content}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
              disabled={currentSlideIndex === 0}
              className="pointer-events-auto transition-opacity opacity-75 hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="pointer-events-auto transition-opacity opacity-75 hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {slides.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlideIndex(0)}
              disabled={currentSlideIndex === 0}
            >
              First Slide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlideIndex(slides.length - 1)}
              disabled={currentSlideIndex === slides.length - 1}
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
              onClick={generatePowerPoint}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download PPTX
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

      {slides.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-8">
          {slides.map((slide, index) => (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                index === currentSlideIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="text-xs font-medium mb-2">Slide {index + 1}</div>
              <h3 className="text-sm font-medium truncate">{slide.title}</h3>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {Array.isArray(slide.content)
                  ? slide.content[0] + (slide.content.length > 1 ? '...' : '')
                  : slide.content}
              </div>
            </Card>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
