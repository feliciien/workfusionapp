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
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "Model name is required" }),
  type: z.string().min(1, { message: "Model type is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

const modelTypes = [
  { value: "classification", label: "Classification" },
  { value: "generation", label: "Generation" },
  { value: "completion", label: "Completion" },
  { value: "embedding", label: "Embedding" },
];

const ModelsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      // Add API call here to handle model creation
      toast.success("Model configuration started successfully");
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Heading
        title="Custom Models"
        description="Train and configure your own AI models for specific tasks."
        icon={Brain}
        iconColor="text-blue-700"
        bgColor="bg-blue-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid gap-4"
            >
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-6">
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter model name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="type"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-6">
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modelTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                  <FormItem className="col-span-12">
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter model description"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                className="col-span-12" 
                disabled={loading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {loading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {!loading && (
            <Empty label="No models created yet." />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
