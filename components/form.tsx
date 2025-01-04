"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as FormProvider, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat-input";
import { Send } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});

interface FormProps {
  schema: z.ZodObject<any>;
  onSubmit: (values: any) => void;
}

export const Form = ({ schema = formSchema, onSubmit }: FormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
      >
        <FormField
          name="prompt"
          render={({ field }) => (
            <FormItem className="col-span-12 lg:col-span-10">
              <FormControl className="m-0 p-0">
                <ChatInput
                  className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                  disabled={isLoading}
                  placeholder="Message SynthAI..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button 
          className="col-span-12 lg:col-span-2 w-full" 
          disabled={isLoading}
          type="submit"
        >
          Send <Send className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </FormProvider>
  );
};
