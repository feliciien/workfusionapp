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
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `art_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <Heading
        title="Art Generation"
        description={isPro ? "Create unlimited AI artworks with our pro plan." : `${apiLimitCount} / 5 Free Generations`}
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
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
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="col-span-12 lg:col-span-10">
                        <FormControl className="m-0 p-0">
                          <Input
                            className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                            disabled={isLoading} 
                            placeholder="A surreal landscape with floating islands..." 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
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
                              {amountOptions.map((option) => (
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
                      name="resolution"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
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
                              {resolutionOptions.map((option) => (
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
                      name="style"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
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
                              {styleOptions.map((option) => (
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
                  <Button 
                    className="col-span-12 lg:col-span-2 w-full" 
                    type="submit" 
                    disabled={isLoading || (!isPro && apiLimitCount >= 5)}
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
                {images.length === 0 && !isLoading && (
                  <Empty label="No images generated." />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <Card 
                      key={image.url} 
                      className="rounded-lg overflow-hidden"
                    >
                      <div className="relative aspect-square">
                        <Image
                          alt="Generated"
                          fill
                          src={image.url}
                        />
                      </div>
                      <Button
                        onClick={() => downloadImage(image.url)}
                        variant="ghost" 
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtPage;
