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
      setMusic(response.data.audio);
      form.reset();
    } catch (error: any) {
      console.error("Error generating music:", error);
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong generating the music.");
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
          description="Create AI-driven music from your text prompt."
          icon={Music}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />

        <div className="bg-white rounded-lg shadow p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 'an upbeat EDM track with synths'"
                        className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none w-full"
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="self-end bg-green-600 hover:bg-green-700"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Generating..." : "Generate"}
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-gray-100">
                <Loader />
              </div>
            )}
            {!music && !isLoading && (
              <Empty label="Enter a prompt and generate music." />
            )}
            {music && (
              <div className="mt-6 space-y-4">
                <audio controls className="w-full rounded" src={music}>
                  Your browser does not support the audio element.
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
    </div>
  );
};

export default MusicPage;