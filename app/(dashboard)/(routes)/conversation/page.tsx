"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { MessageSquare, Moon, Sun, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Analytics } from '@vercel/analytics/react';

import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import useProModal from "@/hooks/use-pro-modal";
import { toast } from "react-hot-toast";
import { formSchema } from "./constants";

const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });

      setMessages((current) => [...current, userMessage, response.data]);
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

  const clearConversation = () => {
    setMessages([]);
    form.reset();
    router.refresh();
  };

  const messageCount = messages.length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">
          SynthAI Conversation
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {messageCount} {messageCount === 1 ? "message" : "messages"}
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={clearConversation}
            className="p-2 rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Clear Conversation"
          >
            <Trash className="w-5 h-5 text-red-600 dark:text-red-500" />
          </button>
        </div>
      </nav>

      {/* Header & Input Form */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <Heading
          title="Conversation"
          description="Our most advanced AI conversation model."
          icon={MessageSquare}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10 dark:bg-violet-500/20"
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border border-gray-200 dark:border-gray-800 w-full p-4 px-3 md:px-6 focus-within:shadow-sm bg-white dark:bg-gray-950 transition-colors duration-300 mt-8 grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      {...field}
                      placeholder="Start typing here..."
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      disabled={isLoading}
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

        {/* Messages Display */}
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="Start typing to have a conversation." />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 md:p-6 w-full flex items-start gap-x-4 rounded-lg",
                    isUser
                      ? "bg-white border border-black/10 dark:bg-gray-950 dark:border-gray-800"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {isUser ? <UserAvatar /> : <BotAvatar />}
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-7 w-full">
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default ConversationPage;