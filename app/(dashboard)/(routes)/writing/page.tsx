"use client";

import * as z from "zod";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required."
  }),
  style: z.string().min(1),
  length: z.string().min(1),
});

const styleOptions = [
  {
    value: "professional",
    label: "Professional"
  },
  {
    value: "casual",
    label: "Casual"
  },
  {
    value: "academic",
    label: "Academic"
  },
  {
    value: "creative",
    label: "Creative"
  },
  {
    value: "technical",
    label: "Technical"
  }
];

const lengthOptions = [
  {
    value: "short",
    label: "Short (100 words)"
  },
  {
    value: "medium",
    label: "Medium (300 words)"
  },
  {
    value: "long",
    label: "Long (500 words)"
  },
  {
    value: "article",
    label: "Article (1000+ words)"
  }
];

const WritingPage = () => {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      style: "professional",
      length: "medium"
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setContent("");

      const response = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 403) {
          toast.error("You have reached your free tier limit. Please upgrade to pro.");
          router.push('/settings');
          return;
        }
        throw new Error(errorData || "Failed to generate content");
      }

      const data = await response.json();
      setContent(data.content);
      form.reset();
    } catch (error: any) {
      console.error('[WRITING_ERROR]', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const writingTool = tools.find(tool => tool.href === "/writing") || {
    label: "Writing Assistant",
    description: "Generate professional writing with AI.",
    icon: MessageSquare,
    href: "/writing",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  };

  return (
    <ToolPage tool={writingTool}>
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-6">
                  <FormControl className="m-0 p-0">
                    <Textarea
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent resize-none"
                      disabled={isLoading}
                      placeholder="Write a blog post about artificial intelligence..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="style"
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
                      {styleOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="length"
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
                      {lengthOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
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
              type="submit"
              disabled={isLoading}
              size="icon"
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
        
        {content === "" && !isLoading && (
          <Card className="rounded-lg p-8 mt-8 border-2 border-dashed">
            <Empty label="Start by describing what you want to write." />
          </Card>
        )}

        {content !== "" && (
          <div className="space-y-4 mt-4">
            <Card className="rounded-lg p-8">
              <pre className="whitespace-pre-wrap font-sans">{content}</pre>
            </Card>
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default WritingPage;
