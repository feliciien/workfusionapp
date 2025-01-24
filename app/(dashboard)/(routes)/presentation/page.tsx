// Use client-side rendering
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Script from "next/script"; // Import Script
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api, { Slide } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Copy,
  RefreshCw,
  FileDown,
  LayoutTemplate,
  Presentation,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Templates for different presentation styles
const PRESENTATION_TEMPLATES = [
  {
    id: "business",
    name: "Business Presentation",
    description: "Professional and formal style",
  },
  {
    id: "educational",
    name: "Educational",
    description: "Clear and instructional format",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Dynamic and engaging style",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Sleek and contemporary design",
  },
  {
    id: "illustrative",
    name: "Illustrative",
    description: "Rich visuals and illustrations",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional design suited for corporate presentations",
  },
];

// Color schemes for presentations
const COLOR_SCHEMES = [
  {
    id: "default",
    name: "Default",
    description: "Standard color scheme",
  },
  {
    id: "light",
    name: "Light",
    description: "Light and airy colors",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark and bold colors",
  },
  {
    id: "colorful",
    name: "Colorful",
    description: "Vibrant and diverse colors",
  },
];

// Styles for different color schemes
const colorSchemeStyles: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  default: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  light: {
    backgroundColor: "#F9F9F9",
    color: "#000000",
  },
  dark: {
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
  },
  colorful: {
    backgroundColor: "#FFD700",
    color: "#000000",
  },
};

export default function PresentationPage() {
  // Tool loading state
  const [isLoadingTool, setIsLoadingTool] = useState(true);
  const [tool, setTool] = useState(
    tools.find((t) => t.href === "/presentation")
  );

  // Form states
  const [topic, setTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("business");
  const [file, setFile] = useState<File | null>(null);
  const [colorScheme, setColorScheme] = useState("default");

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
          <p className="text-sm text-muted-foreground">
            Loading presentation tool...
          </p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          Configuration Error
        </h2>
        <p className="mt-2 text-muted-foreground">
          Unable to load presentation tool configuration.
        </p>
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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setProgress(0);

    if (!topic.trim() && !file) {
      toast.error("Please enter a topic or upload a document");
      return;
    }

    if (topic.length > 1000) {
      toast.error("Topic is too long. Maximum length is 1000 characters");
      return;
    }

    if (
      file &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error("Please upload a valid Word (.docx) document");
      return;
    }

    try {
      setIsLoading(true);
      setSlides([]);
      setCurrentSlideIndex(0);

      // Simulate progress while generating
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      let response;
      if (file) {
        const formData = new FormData();
        formData.append("template", selectedTemplate);
        formData.append("colorScheme", colorScheme);
        formData.append("file", file);

        response = await fetch("/api/presentation", {
          method: "POST",
          body: formData,
        }).then((res) => res.json());
      } else {
        const apiResponse = await api.generatePresentation(
          topic,
          selectedTemplate,
          colorScheme
        );
        if (!apiResponse.success || !apiResponse.data?.slides) {
          throw new Error(apiResponse.error || "Failed to generate presentation");
        }
        response = apiResponse.data;
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (!response?.slides || response.slides.length === 0) {
        throw new Error("No slides generated. Please try again.");
      }

      setSlides(response.slides);
      toast.success("Presentation generated successfully!");
    } catch (err: any) {
      console.error("Error generating presentation:", err);
      toast.error(err.message || "Failed to generate presentation");
      setError(err.message || "Failed to generate presentation");
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setTopic("");
    setFile(null);
    setSlides([]);
    setError(null);
    setCurrentSlideIndex(0);
    setCurrentSlide(null);
    setColorScheme("default");
    setSelectedTemplate("business");
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const generatePowerPoint = async () => {
    if (!slides.length) return;

    try {
      // Dynamically import pptxgenjs only when needed
      const pptxgen = await import("pptxgenjs");
      const PptxGenJS = pptxgen.default;

      const pres = new PptxGenJS();

      // Set presentation properties
      pres.author = "WorkFusion";
      pres.company = "WorkFusion";
      pres.revision = "1";
      pres.subject = topic || "Generated Presentation";
      pres.title = topic || "Generated Presentation";

      // Add slides
      slides.forEach((slide) => {
        const pptSlide = pres.addSlide();

        // Apply color scheme
        let backgroundColor =
          colorSchemeStyles[colorScheme]?.backgroundColor || "#FFFFFF";
        pptSlide.background = { fill: backgroundColor };

        // Add title to all slides
        pptSlide.addText(slide.title, {
          x: "5%",
          y: "5%",
          w: "90%",
          h: "15%",
          fontSize: slide.type === "title" ? 44 : 32,
          bold: true,
          align: "center",
          color: colorSchemeStyles[colorScheme]?.color || "363636",
        });

        // Add content based on slide type
        if (typeof slide.content === "string") {
          // Title slide subtitle
          pptSlide.addText(slide.content, {
            x: "10%",
            y: "30%",
            w: "80%",
            h: "40%",
            fontSize: 28,
            align: "center",
            color: colorSchemeStyles[colorScheme]?.color || "666666",
          });
        } else {
          // Bullet points for other slides
          const bulletPoints = slide.content.map((point) => ({ text: point }));
          pptSlide.addText(bulletPoints, {
            x: "10%",
            y: "25%",
            w: "80%",
            h: "70%",
            fontSize: 24,
            bullet: { type: "bullet" },
            color: colorSchemeStyles[colorScheme]?.color || "363636",
            lineSpacing: 32,
          });
        }

        // Add slide number except for title slide
        if (slide.type !== "title") {
          pptSlide.addText(`${slides.indexOf(slide)}/${slides.length - 1}`, {
            x: "90%",
            y: "95%",
            w: "10%",
            h: "5%",
            fontSize: 12,
            color: colorSchemeStyles[colorScheme]?.color || "666666",
            align: "right",
          });
        }
      });

      // Save the presentation
      const fileName = `${(topic || "presentation")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_presentation.pptx`;
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
      .map((slide) =>
        `${slide.title}\n\n${
          Array.isArray(slide.content)
            ? slide.content.join("\n")
            : slide.content
        }`
      )
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(presentationText);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      {/* Google Tag */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-6RZH54WYJJ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-6RZH54WYJJ');
        `}
      </Script>

      <ToolPage tool={tool} isLoading={isLoading} error={error}>
        {/* Improved design starts here */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Place the entire JSX content here, ensuring all elements are included */}
          {/* Form, slides, navigation buttons, etc. */}
        </div>
      </ToolPage>
    </>
  );
}
