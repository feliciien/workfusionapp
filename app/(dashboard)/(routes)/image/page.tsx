"use client";

import * as z from "zod";
import axios from "axios";
import { Download, ImageIcon, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Empty } from "@/components/empty";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardFooter } from "@/components/ui/card";
import useProModal from "@/hooks/use-pro-modal";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { formSchema, ImageStyle } from "./constants";
import { cn } from "@/lib/utils";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";

const ImagePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [images, setImages] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<Array<{
    prompt: string;
    style: ImageStyle;
    url: string;
  }>>([]);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  const imageTool = tools.find(tool => tool.href === "/image");

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const response = await fetch("/api/subscription");
        const data = await response.json();
        setIsPro(data.isPro);
      } catch (error) {
        console.error("Error checking pro status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "1024x1024",
      style: "realistic"
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);

      const response = await axios.post("/api/image", values);
      
      const urls = response.data.map((image: { url: string }) => image.url);
      
      if (!urls || urls.length === 0) {
        throw new Error("No images were generated");
      }
      
      setImages(urls);
      setImageHistory(prev => [...prev, ...urls.map((url: string) => ({
        prompt: values.prompt,
        style: values.style,
        url
      }))]);

      form.reset();
      toast.success("Images generated successfully!");
    } catch (error: any) {
      console.error("Image generation error:", error);
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        const errorMessage = error?.response?.data || error?.message || "Something went wrong generating the images.";
        toast.error(errorMessage);
      }
    }
  };

  if (!imageTool) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
      </div>
    );
  }

  return (
    <ToolPage
      tool={imageTool}
      isLoading={form.formState.isSubmitting}
    >
      <div className="space-y-8">
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === 'generate' 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === 'history' 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            History
          </button>
        </div>

        {activeTab === 'generate' ? (
          <div className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-xl border w-full p-6 px-3 md:px-8 focus-within:shadow-lg grid grid-cols-12 gap-4 bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormControl className="m-0 p-0">
                        <Input
                          className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent text-lg placeholder:text-muted-foreground/50"
                          disabled={isLoading} 
                          placeholder="A picture of a horse in Swiss alps" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-6">
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="realistic">
                            ✨ Realistic
                          </SelectItem>
                          <SelectItem value="artistic">
                            🎨 Artistic
                          </SelectItem>
                          <SelectItem value="digital">
                            💻 Digital
                          </SelectItem>
                          <SelectItem value="vintage">
                            📷 Vintage
                          </SelectItem>
                          <SelectItem value="minimalist">
                            ⚪ Minimalist
                          </SelectItem>
                          <SelectItem value="fantasy">
                            🌟 Fantasy
                          </SelectItem>
                          <SelectItem value="comic">
                            💭 Comic
                          </SelectItem>
                          <SelectItem value="cinematic">
                            🎬 Cinematic
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resolution"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-6">
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="256x256">
                            256x256 - Draft
                          </SelectItem>
                          <SelectItem value="512x512">
                            512x512 - Standard
                          </SelectItem>
                          <SelectItem value="1024x1024">
                            1024x1024 - HD
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  className="col-span-12 w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-6 text-lg font-medium transition-all rounded-xl shadow-md hover:shadow-lg" 
                  type="submit" 
                  disabled={isLoading} 
                  size="icon"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin" /> Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" /> Generate Image
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
              {images.length === 0 && !isLoading && (
                <div className="p-12 rounded-xl w-full flex items-center justify-center bg-muted/30 border-2 border-dashed">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-primary/10">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">No images generated yet</p>
                    <p className="text-muted-foreground/60 text-sm text-center max-w-[200px]">
                      Enter a prompt above to start generating amazing images
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((src) => (
                  <Card key={src} className="rounded-xl overflow-hidden border-2 hover:shadow-lg transition-all group">
                    <div className="relative aspect-square">
                      <Image
                        alt="Generated"
                        src={src}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardFooter className="p-2">
                      <Button 
                        onClick={() => window.open(src)}
                        variant="secondary" 
                        className="w-full rounded-lg"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {imageHistory.length === 0 ? (
              <div className="p-12 rounded-xl w-full flex items-center justify-center bg-muted/30 border-2 border-dashed">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 rounded-full bg-primary/10">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">No generation history</p>
                  <p className="text-muted-foreground/60 text-sm text-center max-w-[200px]">
                    Your generated images will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {imageHistory.map((item, index) => (
                  <Card key={index} className="rounded-xl overflow-hidden border hover:shadow-lg transition-all">
                    <div className="relative aspect-square">
                      <Image
                        alt="Generated"
                        src={item.url}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2 bg-white/50 backdrop-blur-sm">
                      <p className="text-sm font-medium truncate">{item.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Wand2 className="h-3 w-3" /> {item.style}
                        </span>
                      </div>
                      <Button 
                        onClick={() => {
                          form.setValue('prompt', item.prompt);
                          form.setValue('style', item.style);
                          setActiveTab('generate');
                        }}
                        variant="secondary" 
                        className="w-full mt-2 text-xs"
                      >
                        Regenerate
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default ImagePage;