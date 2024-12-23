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
import { formSchema } from "./constants";
import { cn } from "@/lib/utils";

const ImagePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [images, setImages] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<Array<{
    prompt: string;
    style: string;
    url: string;
    createdAt: Date;
  }>>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [error, setError] = useState<{
    type: 'api' | 'network' | 'validation' | 'general';
    message: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "1024x1024",
      style: "realistic",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let toastLoadingId: string | undefined;
    try {
      setError(null);
      setImages([]);
      toastLoadingId = toast.loading(
        <div className="flex flex-col items-center gap-2">
          <Wand2 className="h-4 w-4 animate-pulse" />
          <span>Creating your masterpiece...</span>
          <span className="text-xs text-gray-500">This may take up to 30 seconds</span>
        </div>
      );

      const response = await axios.post("/api/image", values);
      
      const urls: string[] = response.data.map((image: { url: string }) => image.url);
      setImages(urls);
      
      const newHistoryItems = urls.map((url: string) => ({
        prompt: values.prompt,
        style: values.style,
        url,
        createdAt: new Date()
      }));
      setImageHistory(prev => [...newHistoryItems, ...prev].slice(0, 50));

      toast.success("Images generated successfully!", { id: toastLoadingId });
    } catch (error: any) {
      setError({
        type: error.response?.status === 403 ? 'api' : 
              error.message === 'Network Error' ? 'network' : 'general',
        message: error.response?.data?.error || error.message || 'Something went wrong'
      });
      
      if (error?.response?.status === 403) {
        proModal.onOpen();
      }
      
      if (toastLoadingId) {
        toast.error(error.response?.data?.error || "Something went wrong", { id: toastLoadingId });
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="px-4 lg:px-8">
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8">
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 dark:border-gray-800">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="grid gap-6 rounded-lg"
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="col-span-2 lg:col-span-3">
                      <FormControl>
                        <Input
                          placeholder="A stunning sunset over a mountain lake..."
                          className="focus-visible:ring-2 focus-visible:ring-pink-700 h-12 text-lg"
                          disabled={isLoading} 
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
                    <FormItem>
                      <Select 
                        disabled={isLoading} 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="artistic">Artistic</SelectItem>
                          <SelectItem value="digital">Digital Art</SelectItem>
                          <SelectItem value="vintage">Vintage</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                          <SelectItem value="comic">Comic</SelectItem>
                          <SelectItem value="cinematic">Cinematic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                          <SelectTrigger className="h-12">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1024x1024">Square</SelectItem>
                          <SelectItem value="1792x1024">Landscape</SelectItem>
                          <SelectItem value="1024x1792">Portrait</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  className="col-span-1 w-full h-12 bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-800 hover:to-purple-800"
                  type="submit"
                  disabled={isLoading}
                  size="icon"
                >
                  Generate
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {error && (
        <div className={cn(
          "mt-8 p-4 rounded-lg border transition-all duration-200",
          error.type === 'api' ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
          error.type === 'network' ? "bg-red-50 border-red-200 text-red-800" : 
          "bg-gray-50 border-gray-200 text-gray-800"
        )}>
          <p className="text-sm font-medium flex items-center gap-2">
            {error.type === 'api' && <span className="text-yellow-500">⚠️</span>}
            {error.type === 'network' && <span className="text-red-500">❌</span>}
            {error.message}
          </p>
        </div>
      )}

      {images.length === 0 && !isLoading && (
        <Empty label="No images generated." />
      )}

      {images.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <Card 
              key={index} 
              className="rounded-lg overflow-hidden border-2 hover:border-pink-500 transition-all duration-200"
            >
              <div className="relative aspect-square">
                <Image
                  alt="Generated"
                  src={src}
                  fill
                  className="object-cover"
                />
              </div>
              <CardFooter className="p-2">
                <Button 
                  onClick={() => window.open(src)} 
                  variant="secondary" 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {imageHistory.length > 0 && (
        <div className="space-y-4 mt-12">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-700 to-purple-700 text-transparent bg-clip-text">
              Recent Creations
            </h2>
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setImageHistory([])}
            >
              Clear History
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageHistory.map((item, index) => (
              <Card 
                key={index} 
                className="rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-200"
              >
                <div className="relative aspect-square group">
                  <Image
                    alt={`Generated image ${index}`}
                    src={item.url}
                    fill
                    className="object-cover transition-all duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                    <Button 
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      onClick={() => window.open(item.url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <CardFooter className="p-3 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-1 w-full">
                    <p className="text-sm font-medium truncate">{item.prompt}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{item.style}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePage;