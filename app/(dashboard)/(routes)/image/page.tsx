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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
    try {
      setImages([]);
      const toastId = toast.loading(
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 animate-pulse" />
          <span>Creating your masterpiece...</span>
        </div>
      );
      
      const response = await axios.post("/api/image", {
        prompt: values.prompt,
        amount: "1",
        resolution: values.resolution,
        style: values.style,
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      const urls = response.data.map((image: { url: string }) => image.url);
      setImages(urls);
      
      form.reset({
        ...form.getValues(),
        prompt: "",
      });

      toast.dismiss(toastId);
      toast.success("Your artwork is ready!");
    } catch (error: any) {
      toast.dismiss();
      
      if (error?.response?.status === 403) {
        proModal.onOpen();
        toast.error("Free trial has expired. Please upgrade to pro.");
      } else if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.error || "Invalid request. Please check your inputs.");
      } else if (error?.response?.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to generate image. Please try again.");
      }
      console.error("[IMAGE_ERROR]", error);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="h-full pb-20">
      <Heading
        title="AI Image Creation"
        description="Transform your ideas into stunning visuals with our advanced AI."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8 space-y-6">
        <div className="rounded-xl border-2 border-dashed border-pink-200 bg-white p-6 shadow-sm transition hover:border-pink-300">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                name="prompt"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Describe your imagination... (e.g., A magical forest with glowing butterflies at twilight)"
                        className="border-2 focus-visible:ring-pink-500 h-12 text-lg"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="style"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue defaultValue={field.value} placeholder="Choose style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="realistic">✨ Realistic</SelectItem>
                          <SelectItem value="artistic">🎨 Artistic</SelectItem>
                          <SelectItem value="digital">💻 Digital Art</SelectItem>
                          <SelectItem value="vintage">📷 Vintage</SelectItem>
                          <SelectItem value="minimalist">⚪ Minimalist</SelectItem>
                          <SelectItem value="fantasy">🦄 Fantasy</SelectItem>
                          <SelectItem value="comic">💭 Comic</SelectItem>
                          <SelectItem value="cinematic">🎬 Cinematic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="resolution"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue defaultValue={field.value} placeholder="Choose size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1024x1024">⬛ Square (1:1)</SelectItem>
                          <SelectItem value="1792x1024">🖼️ Landscape (16:9)</SelectItem>
                          <SelectItem value="1024x1792">📱 Portrait (9:16)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-lg"
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 animate-pulse" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Create
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-20">
              <Loader />
            </div>
          )}
          {images.length === 0 && !isLoading && (
            <Empty label="Your creations will appear here" />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((src, index) => (
              <Card 
                key={index} 
                className="rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 border-2"
              >
                <div className="relative aspect-square">
                  <Image
                    fill
                    alt="Generated"
                    src={src}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onClick={() => setSelectedImageIndex(index)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={() => downloadImage(src)}
                      className="bg-white text-black hover:bg-white/90"
                      size="icon"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <Image
              src={images[selectedImageIndex]}
              alt="Preview"
              width={1792}
              height={1024}
              className="rounded-lg object-contain"
            />
            <Button
              className="absolute top-4 right-4 bg-white text-black hover:bg-white/90"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(images[selectedImageIndex]);
              }}
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePage;