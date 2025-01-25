"use client";

import * as z from "zod";
import { MicIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
import { toast } from "react-hot-toast";
import axios from "axios";

import {
  formSchema,
  voiceOptions,
  formatOptions,
  languageOptions,
  emotionOptions,
} from "./constants";

const VoicePage = () => {
  const router = useRouter();
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [apiLimit, setApiLimit] = useState<number>(5); // Assuming 5 as the limit for free users
  const [isPro, setIsPro] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get("/api/user/status");
        setApiLimitCount(response.data.apiLimitCount);
        setApiLimit(response.data.apiLimit);
        setIsPro(response.data.isPro);
      } catch (error) {
        console.error("Failed to fetch user status:", error);
      }
    };
    fetchUserStatus();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      voice: "alloy",
      format: "mp3",
      language: "en",
      emotion: "neutral",
      speed: 1.0,
      pitch: 1.0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/voice", values);

      if (response.status !== 200) {
        if (response.status === 403) {
          router.push("/settings");
          return;
        }
        throw new Error("Failed to generate voice");
      }

      const data = response.data;

      setAudioUrl(data.audio);
      toast.success("Voice generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data || "Something went wrong.");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `voice_${Date.now()}.${form.getValues("format")}`;
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
            : `${apiLimitCount} / ${apiLimit} Free Generations`
        }
        icon={MicIcon}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div className="md:grid md:grid-cols-2 gap-4">
          <div>
            <Card className="p-4 border border-gray-200 dark:border-gray-700">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter text to convert to speech"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="voice"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Voice" />
                              </SelectTrigger>
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
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                              </SelectTrigger>
                              <SelectContent>
                                {languageOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Format" />
                              </SelectTrigger>
                              <SelectContent>
                                {formatOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="emotion"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Emotion" />
                              </SelectTrigger>
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
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="speed"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-sm font-medium">Speed</label>
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
                  <FormField
                    name="pitch"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-sm font-medium">Pitch</label>
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
                  <Button
                    type="submit"
                    disabled={isLoading || (!isPro && apiLimitCount >= apiLimit)}
                    className="w-full"
                  >
                    {isLoading ? "Generating..." : "Generate"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
          <div className="mt-4 md:mt-0">
            <Card className="p-4 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {isLoading && (
                  <div className="p-20">
                    <Loader />
                  </div>
                )}
                {!audioUrl && !isLoading && (
                  <Empty label="No audio generated yet. Your audio will appear here." />
                )}
                {audioUrl && (
                  <div className="flex flex-col items-center space-y-4">
                    <audio controls src={audioUrl} className="w-full" />
                    <Button
                      onClick={downloadAudio}
                      variant="secondary"
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
