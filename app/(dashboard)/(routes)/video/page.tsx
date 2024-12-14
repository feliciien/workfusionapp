"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Video } from "lucide-react";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Empty } from "@/components/empty";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

import useProModal from "@/hooks/use-pro-modal";
import { toast } from "react-hot-toast";
import { formSchema } from "./constants";

const STAGES = {
  INITIALIZING: {
    progress: 10,
    message: "Initializing AI model...",
    detail: "Setting up the video generation pipeline"
  },
  PROCESSING_PROMPT: {
    progress: 30,
    message: "Processing your prompt...",
    detail: "Converting your text into visual concepts"
  },
  GENERATING_FRAMES: {
    progress: 50,
    message: "Generating video frames...",
    detail: "Creating individual frames for your video"
  },
  RENDERING: {
    progress: 70,
    message: "Rendering video...",
    detail: "Combining frames into smooth motion"
  },
  FINALIZING: {
    progress: 90,
    message: "Finalizing...",
    detail: "Preparing video for delivery"
  },
  COMPLETED: {
    progress: 100,
    message: "Generation complete!",
    detail: "Your video is ready"
  }
};

const VideoPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [video, setVideo] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<keyof typeof STAGES | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const updateProgress = (currentStage: keyof typeof STAGES) => {
    setStage(currentStage);
    setProgress(STAGES[currentStage].progress);
  };

  const getElapsedTime = () => {
    if (!startTime) return "";
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return elapsed > 0 ? ` (${elapsed}s)` : "";
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setVideo("");
      setStartTime(Date.now());
      updateProgress("INITIALIZING");
      
      // Start the generation
      setTimeout(() => updateProgress("PROCESSING_PROMPT"), 2000);
      
      const response = await axios.post("/api/video", {
        prompt: values.prompt,
      });

      console.log("API Response:", response.data);

      updateProgress("GENERATING_FRAMES");
      
      // Simulate progress through stages
      const stageInterval = setInterval(() => {
        setStage((currentStage) => {
          if (!currentStage) return "GENERATING_FRAMES";
          const stages = Object.keys(STAGES) as (keyof typeof STAGES)[];
          const currentIndex = stages.indexOf(currentStage);
          if (currentIndex < stages.length - 2) { // -2 to not auto-advance to COMPLETED
            updateProgress(stages[currentIndex + 1]);
          }
          return currentStage;
        });
      }, 8000); // Update every 8 seconds

      if (Array.isArray(response.data) && response.data.length > 0) {
        clearInterval(stageInterval);
        updateProgress("COMPLETED");
        setVideo(response.data[0]);
        form.reset();
        toast.success("Video generated successfully!");
      } else {
        clearInterval(stageInterval);
        toast.error("No video output received");
        setProgress(0);
        setStage(null);
      }
      
    } catch (error: any) {
      console.error("Error:", error?.response?.data || error);
      setProgress(0);
      setStage(null);
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error(error?.response?.data || "Something went wrong generating the video.");
      }
    }
  };

  const handleDownload = async () => {
    if (!video) return;

    try {
      setDownloading(true);
      const response = await axios.get(video, {
        responseType: 'blob'
      });
      
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `generated-video-${timestamp}.mp4`;

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Video downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading video");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <Heading
        title="Video Generation"
        description="Turn your prompt into video."
        icon={Video}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl>
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="A cinematic shot of a dog running through a forest..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                type="submit"
                disabled={isLoading}
                size="icon"
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && stage && (
            <div className="p-8 rounded-lg w-full flex flex-col items-center justify-center bg-muted">
              <div className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{STAGES[stage].message}</p>
                  <p className="text-sm text-muted-foreground">{progress}%</p>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">{STAGES[stage].detail}</p>
                  <p className="text-sm text-muted-foreground">{getElapsedTime()}</p>
                </div>
              </div>
            </div>
          )}
          {!video && !isLoading && (
            <Empty label="No video generated." />
          )}
          {video && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Video</h3>
                <Button 
                  onClick={handleDownload} 
                  disabled={downloading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {downloading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Video
                    </>
                  )}
                </Button>
              </div>
              <video
                className="w-full aspect-video rounded-lg border bg-black"
                controls
                src={video}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;