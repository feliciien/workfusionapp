"use client";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { BrainCircuit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required",
  }),
});

const NeuralPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    output: string;
    confidence: number;
    steps: { name: string; status: string }[];
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setProcessing(true);
      setResult(null);

      const response = await fetch("/api/neural", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          proModal.onOpen();
        }
        return;
      }

      const data = await response.json();
      setResult(data);
      form.reset();
    } catch (error: any) {
      console.error(error);
    } finally {
      setProcessing(false);
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Neural Processing"
        description="Advanced neural network processing for complex tasks."
        icon={BrainCircuit}
        iconColor="text-purple-700"
        bgColor="bg-purple-700/10"
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
                      placeholder="Analyze this data pattern..."
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
              Process
            </Button>
          </form>
        </Form>
        {processing && (
          <div className="space-y-4 mt-4">
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          </div>
        )}
        {!processing && !result && (
          <Empty label="Start with a prompt to begin neural processing" />
        )}
        {result && (
          <div className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Analysis Results</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={result.confidence * 100}
                    className={cn(
                      "h-2",
                      result.confidence > 0.7 ? "bg-green-500" :
                      result.confidence > 0.4 ? "bg-yellow-500" :
                      "bg-red-500"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  {result.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        step.status === "completed" ? "bg-green-500" :
                        step.status === "processing" ? "bg-yellow-500" :
                        "bg-gray-300"
                      )} />
                      <span>{step.name}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{result.output}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralPage;
