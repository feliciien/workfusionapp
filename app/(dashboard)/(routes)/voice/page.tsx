"use client";

import * as z from "zod";
import { MicIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Slider } from "@/components/ui/slider";

import { formSchema, voiceOptions, emotionOptions } from "./constants";
import { toast } from "react-hot-toast";

const VoicePage = () => {
  const router = useRouter();
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      voice: "alloy",
      emotion: "neutral",
      speed: 1.0,
      pitch: 1.0,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting values:", values); // Added for debugging
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/settings");
          return;
        }
        throw new Error("Failed to generate voice");
      }

      const data = await response.json();

      setAudioUrl(data.audio);
      setApiLimitCount(data.remaining);
      setIsPro(data.isPro);

      form.reset();
      toast.success("Voice generated successfully!");
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong.");
    } finally {
      router.refresh();
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `voice_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audio downloaded successfully!");
  };

  return (
    <div className="h-full p-4 space-y-4">
      <Heading
        title="Voice Synthesis"
        description={
          isPro
            ? "Create unlimited AI voices with our pro plan."
            : `${apiLimitCount} / 5 Free Generations`
        }
        icon={MicIcon}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
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
                    name="text"
                    render={({ field }) => (
                      <FormItem className="col-span-12 lg:col-span-10">
                        <FormControl className="m-0 p-0">
                          <Input
                            className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                            disabled={isLoading}
                            placeholder="Enter the text you want to convert to speech..."
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
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Voice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {voiceOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
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
                        <FormItem className="col-span-1">
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Emotion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {emotionOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Speed</label>
                    <FormField
                      control={form.control}
                      name="speed"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Slider
                              disabled={isLoading}
                              min={0.25}
                              max={4.0}
                              step={0.25}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    className="col-span-12 lg:col-span-2 w-full"
                    type="submit"
                    disabled={
                      isLoading || (!isPro && apiLimitCount >= 5)
                    }
                    size="icon"
                  >
                    Generate
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
          <div className="mt-4 md:mt-0">
            <Card className="p-4 border-black/5 dark:border-white/5">
              <div className="space-y-4">
                {isLoading && (
                  <div className="p-20">
                    <Loader />
                  </div>
                )}
                {!audioUrl && !isLoading && (
                  <Empty label="No audio generated." />
                )}
                {audioUrl && (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <audio controls src={audioUrl} className="w-full" />
                    <Button
                      onClick={downloadAudio}
                      variant="ghost"
                      className="w-full"
                    >
                      Download Audio
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePage;
