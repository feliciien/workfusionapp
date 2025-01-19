// app/(dashboard)/(routes)/image/page.tsx

"use client";

import * as z from "zod";
import axios from "axios";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardFooter } from "@/components/ui/card";
import useProModal from "@/hooks/use-pro-modal";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { formSchema } from "./constants";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";

const ImagePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [images, setImages] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<
    Array<{
      prompt: string;
      style: string;
      amount: number;
      url: string;
    }>
  >([]);
  const [isPro, setIsPro] = useState(false);

  const imageTool = tools.find((tool) => tool.href === "/image");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: 1,
      style: "realistic",
    },
  });

  const { handleSubmit, formState, control } = form;

  const isLoading = formState.isSubmitting;

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const response = await fetch("/api/subscription");
        const data = await response.json();
        setIsPro(data.isPro);
      } catch (error) {
        console.error("Error checking pro status:", error);
        setIsPro(false);
      }
    };

    checkProStatus();
  }, []);

  useEffect(() => {
    if (imageTool && !imageTool.limitedFree && !isPro) {
      router.push("/");
      proModal.onOpen();
    }
  }, [imageTool, isPro, router, proModal]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted", values); // Existing logging
    try {
      setImages([]);

      const response = await axios.post("/api/image", values);

      const urls = response.data.data.map((image: { url: string }) => image.url);

      setImages(urls);
      setImageHistory((prev) => [
        ...prev,
        ...urls.map((url: string) => ({
          prompt: values.prompt,
          style: values.style,
          amount: values.amount,
          url,
        })),
      ]);

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  // Added onError handler to log validation errors
  const onError = (errors: any) => {
    console.log("Form errors", errors);
  };

  if (!imageTool) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Tool not found</p>
      </div>
    );
  }

  return (
    <ToolPage tool={imageTool}>
      <div>
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            {/* Updated Prompt field */}
            <FormItem className="col-span-12">
              <FormLabel>Prompt</FormLabel>
              <FormControl className="m-0 p-0">
                <Controller
                  name="prompt"
                  control={control}
                  render={({ field }) => (
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="A picture of a horse in Swiss alps"
                      {...field}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            {/* Updated Style field */}
            <FormItem className="col-span-12">
              <FormLabel>Style</FormLabel>
              <FormControl>
                <Controller
                  name="style"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
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
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            {/* Updated Amount field */}
            <FormItem className="col-span-12">
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      disabled={isLoading}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <button
              className="col-span-12 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </form>
        </FormProvider>
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {images.length === 0 && !isLoading && (
          <Empty label="No images generated." />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {images.map((src) => (
            <Card key={src} className="rounded-lg overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  fill
                  alt="Generated"
                  src={src}
                  sizes="(max-width: 768px) 100vw,
                      (max-width: 1200px) 50vw,
                      33vw"
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
    </ToolPage>
  );
};

export default ImagePage;
