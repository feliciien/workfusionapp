"use client";

import * as z from "zod";
import { Download, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

import { formSchema, amountOptions, resolutionOptions, styleOptions } from "./constants";
import { toast } from "react-hot-toast";

const ArtPage = () => {
  const router = useRouter();
  const [images, setImages] = useState<Array<{url: string}>>([]);
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512",
      style: "realistic"
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      
      const response = await fetch("/api/art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("You have reached your free tier limit. Please upgrade to pro.");
          router.push('/settings');
          return;
        }
        throw new Error("Failed to generate images");
      }

      const data = await response.json();
      
      setImages(data.images);
      setApiLimitCount(data.remaining);
      setIsPro(data.isPro);

      form.reset();
      toast.success('Images generated successfully!');
    } catch (error: any) {
      console.log('[ART_ERROR]', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      router.refresh();
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      toast.loading('Downloading image...');
      
      // First check if the image is accessible
      const checkResponse = await fetch(imageUrl, { method: 'HEAD' });
      if (!checkResponse.ok) {
        throw new Error('Image is no longer accessible');
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate a more descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      const promptText = form.getValues('prompt').slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `art_${promptText}_${timestamp}.png`;
      
      // Use click event to handle download
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      link.dispatchEvent(clickEvent);
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success('Image downloaded successfully!');
      }, 100);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to download image');
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingIndex(index);
    await downloadImage(imageUrl);
    setDownloadingIndex(null);
  };

  return (
    <div className="h-full p-4 space-y-6">
      <Heading
        title="AI Art Studio"
        description={isPro ? "Transform your imagination into stunning artwork." : `${apiLimitCount} / 5 Free Generations`}
        icon={ImageIcon}
        iconColor="text-fuchsia-500"
        bgColor="bg-fuchsia-500/10"
      />
      <div className="px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-black/5 dark:border-white/5 shadow-lg hover:shadow-xl transition-shadow">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Your Art</h3>
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="min-h-[60px] text-lg p-4 bg-background border-2 border-black/5 dark:border-white/5 rounded-xl focus-visible:ring-fuchsia-500"
                            disabled={isLoading} 
                            placeholder="A surreal landscape with floating islands..." 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            disabled={isLoading} 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background border-2 border-black/5 dark:border-white/5 rounded-xl h-[50px]">
                                <SelectValue defaultValue={field.value} placeholder="Style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {styleOptions.map((option) => (
                                <SelectItem 
                                  key={option.value} 
                                  value={option.value}
                                  className="cursor-pointer hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10"
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            disabled={isLoading} 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background border-2 border-black/5 dark:border-white/5 rounded-xl h-[50px]">
                                <SelectValue defaultValue={field.value} placeholder="Amount" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {amountOptions.map((option) => (
                                <SelectItem 
                                  key={option.value} 
                                  value={option.value}
                                  className="cursor-pointer hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10"
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
                      name="resolution"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            disabled={isLoading} 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background border-2 border-black/5 dark:border-white/5 rounded-xl h-[50px]">
                                <SelectValue defaultValue={field.value} placeholder="Resolution" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resolutionOptions.map((option) => (
                                <SelectItem 
                                  key={option.value} 
                                  value={option.value}
                                  className="cursor-pointer hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10"
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
                </div>
                <Button 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white py-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  type="submit"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-6 w-6 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ImageIcon className="h-6 w-6" />
                      <span>Generate Art</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-4">
            {isLoading && (
              <div className="p-20">
                <Loader className="w-10 h-10 animate-spin mx-auto" />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Creating your masterpiece...
                </p>
              </div>
            )}
            
            {images.length === 0 && !isLoading && (
              <Card className="rounded-xl p-12 border-2 border-dashed">
                <Empty label="Your generated artwork will appear here." />
              </Card>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {images.map((image, index) => (
                  <Card key={index} className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative aspect-square">
                      <Image
                        alt="Generated art"
                        src={image.url}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 bg-black/5 dark:bg-white/5">
                      <Button 
                        onClick={() => handleDownload(image.url, index)}
                        className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-4 font-medium transition-colors"
                        disabled={downloadingIndex === index}
                      >
                        {downloadingIndex === index ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Downloading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Download Artwork</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtPage;
