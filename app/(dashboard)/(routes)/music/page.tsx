"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Empty } from "@/components/empty";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useProModal from "@/hooks/use-pro-modal";
import { toast } from "react-hot-toast";
import { formSchema } from "./constants";

const MusicPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [music, setMusic] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic("");
      const response = await axios.post("/api/music", {
        prompt: values.prompt,
      });

      if (!response.data.audio) {
        throw new Error("No audio received from the API");
      }

      setMusic(response.data.audio);
      form.reset();
      toast.success("Music generated successfully!");
    } catch (error: any) {
      console.error("Error generating music:", error);
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        const errorMessage = error?.response?.data || error?.message || "Something went wrong generating the music.";
        console.error("Full error details:", {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          message: error?.message
        });
        toast.error(errorMessage);
      }
    } finally {
      router.refresh();
    }
  };

  const handleDownload = () => {
    if (!music) return;

    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = music;
    link.download = "generated-music.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl">
        <Heading
          title="Music Generation"
          description="Turn your prompt into music."
          icon={Music}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />

        <div className="px-4 lg:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Piano solo in jazz style..."
                        {...field}
                      />
                    </FormControl>
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
          {isLoading && (
            <div className="p-20">
              <Loader />
            </div>
          )}
          {!music && !isLoading && (
            <Empty label="No music generated." />
          )}
          {music && (
            <div className="p-4 mt-8 rounded-lg border w-full flex items-center justify-center bg-black">
              <audio controls className="w-full">
                <source src={music} />
              </audio>
              <div className="flex justify-between items-center">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;