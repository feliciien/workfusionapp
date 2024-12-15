"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronRight, ChevronLeft, Download, Copy, RefreshCw, FileDown } from "lucide-react";
import { Slide } from "@/lib/api-client";

// We'll load pptxgenjs dynamically only when needed
let PptxGenJS: any;

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);

  // Update current slide when slides or index changes
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex < slides.length) {
      setCurrentSlide(slides[currentSlideIndex]);
    } else {
      setCurrentSlide(null);
    }
  }, [slides, currentSlideIndex]);

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
      setCurrentSlideIndex(0);
      setCurrentSlide(null);
      
      console.log("Generating presentation for topic:", topic);
      const response = await api.generatePresentation(topic);
      console.log("API Response:", response);

      if (!response?.data?.slides) {
        throw new Error("Failed to generate presentation");
      }

      const validSlides = response.data.slides.filter(slide => 
        slide && 
        typeof slide === 'object' &&
        ['title', 'intro', 'content', 'conclusion'].includes(slide.type) &&
        typeof slide.title === 'string' &&
        (typeof slide.content === 'string' || Array.isArray(slide.content))
      );

      if (validSlides.length === 0) {
        throw new Error("No valid slides generated");
      }

      setSlides(validSlides);
      setCurrentSlideIndex(0);
      setCurrentSlide(validSlides[0]);
      toast.success("Presentation generated!");
    } catch (error: any) {
      console.error("Presentation error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to generate presentation";
      setError(errorMessage);
      toast.error(errorMessage);
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

  const clearForm = useCallback(() => {
    setTopic("");
    setSlides([]);
    setError(null);
    setCurrentSlideIndex(0);
    setCurrentSlide(null);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const previousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  const generatePowerPoint = useCallback(async () => {
    if (!slides.length) return;

    try {
      // Dynamically import pptxgenjs only when needed
      if (!PptxGenJS) {
        const pptxgen = await import('pptxgenjs');
        PptxGenJS = pptxgen.default;
      }

      const pres = new PptxGenJS();

      // Set presentation properties
      pres.author = 'SynthAI';
      pres.company = 'SynthAI';
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
  }, [slides, topic]);

  const copyToClipboard = useCallback(() => {
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
  }, [slides]);

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-6">
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

        <form onSubmit={onSubmit} className="space-y-6">
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

          {currentSlide && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Slide Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                      Slide {currentSlideIndex + 1} of {slides.length} • {currentSlide.type}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousSlide}
                        disabled={currentSlideIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextSlide}
                        disabled={currentSlideIndex === slides.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Current Slide */}
                  <div className="space-y-4 min-h-[300px] flex flex-col">
                    <h2 className="text-2xl font-bold text-center">
                      {currentSlide.title}
                    </h2>
                    <div className="flex-grow">
                      {typeof currentSlide.content === 'string' ? (
                        <p className="text-lg text-center text-muted-foreground mt-4">
                          {currentSlide.content}
                        </p>
                      ) : (
                        <ul className="list-disc pl-6 space-y-3 mt-4">
                          {currentSlide.content.map((point, index) => (
                            <li key={index} className="text-lg">
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
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
                </div>
              </Card>
            </div>
          )}
        </form>
      </div>
    </ToolPage>
  );
}
