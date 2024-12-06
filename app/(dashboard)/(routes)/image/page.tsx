"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Download, ImageIcon, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Analytics } from '@vercel/analytics/react';

import { Empty } from "@/components/empty";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardFooter } from "@/components/ui/card";
import useProModal from "@/hooks/use-pro-modal";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { amountOptions, formSchema, resolutionOptions } from "./constants";

const ImagePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [images, setImages] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Dark mode toggle effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      const response = await axios.post("/api/image", values);
      const urls = response.data.map((image: { url: string }) => image.url);
      setImages(urls);
      form.reset();
    } catch (error: any) {
      console.log(error);
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-semibold">
          SynthAI Image Generation
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </nav>

      {/* Header & Form */}
      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        <Heading
          title="Image Generation"
          description="Our most advanced AI Image Generation model."
          icon={ImageIcon}
          iconColor="text-pink-700 dark:text-pink-500"
          bgColor="bg-pink-700/10 dark:bg-pink-900/20"
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border border-gray-200 dark:border-gray-800 w-full p-4 px-3 md:px-6 focus-within:shadow-sm bg-white dark:bg-gray-950 transition-colors duration-300 mt-8 grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-6">
                  <FormControl className="m-0 p-0">
                    <Input
                      {...field}
                      placeholder="Describe the image you want to create..."
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
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
              name="resolution"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
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
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
            >
              Generate
            </Button>
          </form>
        </Form>

        {/* Results Section */}
        <div className="space-y-4 mt-8">
          {isLoading && (
            <div className="p-20 flex items-center justify-center">
              <Loader />
            </div>
          )}
          {images.length === 0 && !isLoading && (
            <Empty label="Start typing to generate images." />
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {images.map((image, index) => (
                <Card key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
                  <div className="relative aspect-square">
                    <Image src={image} fill alt="Generated Image" className="object-cover" />
                  </div>
                  <CardFooter className="p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      onClick={() => window.open(image)}
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default ImagePage;