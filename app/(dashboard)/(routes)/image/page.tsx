"use client";

import * as z from "zod";
import axios from "axios";
import { Download, ImageIcon } from "lucide-react";
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

const ImagePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [images, setImages] = useState<string[]>([]);

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
      const toastId = toast.loading("Generating image...");
      
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
      toast.success("Successfully generated image!");
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

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your imagination into reality with our AI image generator."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid gap-4 md:grid-cols-12"
          >
            <FormField
              name="prompt"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-6">
                  <FormControl className="m-0 p-0">
                    <Input
                      {...field}
                      placeholder="A futuristic city at sunset..."
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="style"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select style" />
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
            <FormField
              name="resolution"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Resolution" />
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
              className="col-span-12 lg:col-span-2 w-full" 
              type="submit"
              disabled={isLoading}
              size="icon"
            >
              Generate
            </Button>
          </form>
        </Form>

        <div className="space-y-4 mt-8">
          {isLoading && (
            <div className="p-20">
              <Loader />
            </div>
          )}
          {images.length === 0 && !isLoading && (
            <Empty label="No images generated yet." />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {images.map((src, index) => (
              <Card key={index} className="rounded-lg overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    fill
                    alt="Generated"
                    src={src}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        </div>
      </div>
    </div>
  );
};

export default ImagePage;