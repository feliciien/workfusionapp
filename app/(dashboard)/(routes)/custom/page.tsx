"use client";

import * as z from "zod";
import { Brain } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Progress } from "@/components/ui/progress";

import { formSchema, modelTypes } from "./constants";
import { toast } from "react-hot-toast";

const CustomPage = () => {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      parameters: {
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001
      }
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setTraining(true);
      setProgress(0);
      setModelStatus("Preparing training data...");

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("type", values.type);
      formData.append("description", values.description);
      formData.append("parameters", JSON.stringify(values.parameters));
      
      if (files) {
        Array.from(files).forEach((file) => {
          formData.append("trainingData", file);
        });
      }

      const response = await fetch("/api/custom", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to start training");
      }

      const data = await response.json();
      const modelId = data.modelId;

      // Start polling for training status
      const statusInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/custom/${modelId}/status`);
        const statusData = await statusResponse.json();

        setProgress(statusData.progress);
        setModelStatus(statusData.status);

        if (statusData.status === "completed" || statusData.status === "failed") {
          clearInterval(statusInterval);
          setTraining(false);
          
          if (statusData.status === "completed") {
            toast.success("Model training completed successfully!");
          } else {
            toast.error("Model training failed. Please try again.");
          }
        }
      }, 2000);

      form.reset();
    } catch (error: any) {
      console.log('[CUSTOM_ERROR]', error);
      toast.error('Something went wrong. Please try again.');
      setTraining(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <Heading
        title="Custom AI Models"
        description="Train and configure your own AI models for specific tasks."
        icon={Brain}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <div className="md:grid md:grid-cols-2 gap-4">
          <Card className="p-4 border-black/5 dark:border-white/5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading || training}
                          placeholder="Enter a name for your model"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Type</FormLabel>
                      <Select
                        disabled={isLoading || training}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modelTypes.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{type.label}</span>
                                <span className="text-xs text-gray-500">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isLoading || training}
                          placeholder="Describe what your model will do..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Training Data</FormLabel>
                  <Input
                    type="file"
                    multiple
                    onChange={onFileChange}
                    disabled={isLoading || training}
                    accept=".csv,.json,.txt,.jpg,.jpeg,.png"
                    className="mt-2"
                  />
                  <FormDescription>
                    Upload your training data files (CSV, JSON, TXT for text models; JPG, PNG for image models)
                  </FormDescription>
                </div>
                <div className="space-y-4">
                  <FormLabel>Training Parameters</FormLabel>
                  <FormField
                    name="parameters.epochs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Epochs: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            disabled={isLoading || training}
                            min={1}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="parameters.batchSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Batch Size: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            disabled={isLoading || training}
                            min={1}
                            max={128}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="parameters.learningRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Learning Rate: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            disabled={isLoading || training}
                            min={0.0001}
                            max={0.1}
                            step={0.0001}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || training}
                  className="w-full"
                >
                  {training ? "Training in Progress..." : "Start Training"}
                </Button>
              </form>
            </Form>
          </Card>
          <div className="mt-4 md:mt-0">
            <Card className="p-4 border-black/5 dark:border-white/5">
              <div className="space-y-4">
                {!training && !modelStatus && (
                  <Empty label="No training in progress" />
                )}
                {training && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Training Progress</div>
                      <Progress value={progress} />
                      <div className="text-xs text-gray-500">{modelStatus}</div>
                    </div>
                    <div className="p-8">
                      <Loader />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomPage;
