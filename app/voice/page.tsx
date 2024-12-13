"use client";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { MessageSquare, Music, Download, Repeat, Volume2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useProModal } from "@/hooks/use-pro-modal";

const VoicePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [voices, setVoices] = useState<Array<{url: string, text: string, voice: string}>>([]);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      voice: "male",
      emotion: "neutral",
      name: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          speed,
          pitch
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          router.push('/settings');
          return;
        }
        throw new Error("Failed to generate voice");
      }

      const data = await response.json();
      
      setVoices(current => [...current, {
        url: data.audio,
        text: values.prompt,
        voice: values.voice
      }]);

      // Update API limit count if not pro
      if (!data.isPro) {
        setApiLimitCount(data.remaining);
      }
      setIsPro(data.isPro);

      form.reset();
      toast.success('Voice generated successfully!');
    } catch (error: any) {
      console.log(error);
      toast.error('Something went wrong.');
    } finally {
      router.refresh();
    }
  };

  const downloadAudio = (url: string, text: string) => {
    const link = document.createElement('a');
    link.href = url;
    // Create a sanitized filename from the text
    const filename = text
      .slice(0, 30) // Take first 30 characters
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
      .toLowerCase();
    link.download = `voice_${filename}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audio downloaded successfully!');
  };

  const clearHistory = () => {
    setVoices([]);
    toast.success('History cleared!');
  };

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      </div>
      <main className="md:pl-72">
        <Heading
          title="Voice Synthesis"
          description={isPro ? "Generate unlimited voices with our pro plan." : `${apiLimitCount} / 5 Free Generations`}
          icon={Music}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />
        <div className="px-4 lg:px-8">
          <div className="md:grid md:grid-cols-2 gap-4">
            <div>
              <Card className="p-4 border-black/5 dark:border-white/5">
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="rounded-lg border-0 w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid gap-4"
                  >
                    <FormField
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-12">
                          <FormControl className="m-0 p-0">
                            <Input
                              className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                              disabled={isLoading} 
                              placeholder="Name your voice generation (optional)" 
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="prompt"
                      render={({ field }) => (
                        <FormItem className="col-span-12">
                          <FormControl className="m-0 p-0">
                            <textarea
                              className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={isLoading} 
                              placeholder="Enter text to convert to speech..." 
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="voice"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <select 
                              className="w-full p-2 rounded-md border border-gray-300"
                              disabled={isLoading}
                              {...field}
                            >
                              <option value="male">Male Voice</option>
                              <option value="female">Female Voice</option>
                              <option value="child">Child Voice</option>
                            </select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emotion"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <select 
                              className="w-full p-2 rounded-md border border-gray-300"
                              disabled={isLoading}
                              {...field}
                            >
                              <option value="neutral">Neutral</option>
                              <option value="happy">Happy</option>
                              <option value="sad">Sad</option>
                              <option value="angry">Angry</option>
                            </select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Speed ({speed}x)</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={speed}
                          onChange={(e) => setSpeed(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Pitch ({pitch}x)</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={pitch}
                          onChange={(e) => setPitch(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        type="submit" 
                        disabled={isLoading || (!isPro && apiLimitCount >= 5)} 
                        className="w-32"
                      >
                        Generate
                      </Button>
                      {voices.length > 0 && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={clearHistory}
                          className="w-32"
                        >
                          Clear History
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </Card>
            </div>
            <div className="mt-4 md:mt-0">
              <Card className="p-4 border-black/5 dark:border-white/5">
                <div className="space-y-4">
                  {isLoading && (
                    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                      <Loader />
                    </div>
                  )}
                  {voices.length === 0 && !isLoading && (
                    <Empty label="No voice generated yet." />
                  )}
                  <div className="flex flex-col gap-y-4">
                    {voices.map((item, index) => (
                      <div 
                        key={index}
                        className="p-4 w-full flex flex-col gap-y-4 bg-white/10 border rounded-lg"
                      >
                        <div className="text-sm text-gray-500 break-words">
                          {item.text}
                        </div>
                        <div className="flex items-center gap-x-4">
                          <div className="flex-1">
                            <audio controls className="w-full">
                              <source src={item.url} />
                            </audio>
                          </div>
                          <Button
                            onClick={() => downloadAudio(item.url, item.text)}
                            variant="ghost"
                            size="icon"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VoicePage;
