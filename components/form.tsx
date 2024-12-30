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
  isLoading: boolean;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export const Form = ({ isLoading, onSubmit }: FormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    form.reset();
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
                  onSubmit={form.handleSubmit(handleSubmit)}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button 
          className="col-span-12 lg:col-span-2 w-full gap-2" 
          type="submit" 
          disabled={isLoading}
          size="lg"
        >
          <Send className="w-4 h-4" />
          Send
        </Button>
      </form>
    </FormProvider>
  );
};
