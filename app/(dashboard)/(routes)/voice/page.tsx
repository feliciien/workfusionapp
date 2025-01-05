"use client";

import * as z from "zod";
import { MicIcon, Download, Play, Square, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

import { formSchema, voiceOptions, emotionOptions } from "./constants";
import { toast } from "react-hot-toast";

const VoicePage = () => {
  const router = useRouter();
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      voice: "male",
      emotion: "neutral",
      speed: 1.0,
      pitch: 1.0
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setAudioUrl("");
      
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Free tier limit reached. Upgrade to pro for unlimited generations.');
          router.push('/settings');
          return;
        }
        throw new Error("Failed to generate voice");
      }

      const data = await response.json();
      
      setAudioUrl(data.audio);
      setApiLimitCount(data.remaining);
      setIsPro(data.isPro);

      toast.success('Voice generated successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error('Something went wrong.');
    } finally {
      router.refresh();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `workfusion_voice_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audio downloaded successfully!');
  };

  return (
    <div className="h-full p-4 space-y-4">
      <Heading
        title="Voice Synthesis"
        description={isPro ? "Create unlimited AI voices with our pro plan." : `${apiLimitCount} / 5 Free Generations`}
        icon={MicIcon}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div className="md:grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-black/5 dark:border-white/5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text to Speak</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter the text you want to convert to speech..."
                          className="resize-none h-32"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice</FormLabel>
                        <Select 
                          disabled={isLoading} 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue defaultValue={field.value} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {voiceOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emotion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emotion</FormLabel>
                        <Select 
                          disabled={isLoading} 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue defaultValue={field.value} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {emotionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speaking Speed: {field.value}x</FormLabel>
                        <FormControl>
                          <Slider
                            disabled={isLoading}
                            min={0.25}
                            max={4.0}
                            step={0.25}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                            className="pt-2"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pitch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Pitch: {field.value}x</FormLabel>
                        <FormControl>
                          <Slider
                            disabled={isLoading}
                            min={0.25}
                            max={4.0}
                            step={0.25}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                            className="pt-2"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Generate Voice"}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>

          <Card className="p-6 border-black/5 dark:border-white/5">
            <div className="h-full flex flex-col justify-between">
              {audioUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center items-center h-48 bg-muted/20 rounded-lg">
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      className="mx-2"
                    >
                      {isPlaying ? (
                        <Square className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                    <Button
                      onClick={downloadAudio}
                      size="lg"
                      variant="outline"
                      className="mx-2"
                    >
                      <Download className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Click play to preview or download to save the audio file
                  </div>
                </div>
              ) : (
                <Empty 
                  label="No voice generated yet" 
                  icon={MicIcon}
                  iconColor="text-violet-500"
                  bgColor="bg-violet-500/10"
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoicePage;
