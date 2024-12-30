"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Heading } from "@/components/heading";
import { MessageSquare, Moon, Sun, Trash } from "lucide-react";
import { Form } from "@/components/form";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import * as z from "zod";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});

interface ConversationClientProps {
  initialMessages?: Message[];
  conversationId?: string | null;
}

export function ConversationClient({ 
  initialMessages = [], 
  conversationId 
}: ConversationClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMessages(initialMessages);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, [initialMessages]);

  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const userMessage: Message = {
        role: 'user',
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const response = await axios.post('/api/conversation', {
        messages: newMessages,
        conversationId,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.content
      };

      setMessages(current => [...current, assistantMessage]);

    } catch (error: any) {
      console.error('[CONVERSATION_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    router.refresh();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-full relative">
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
          )}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={clearConversation}
          className={cn(
            "p-2 rounded-lg transition-colors",
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
          )}
          title="Clear Conversation"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
      <div className="px-4 lg:px-8">
        <div>
          <Form 
            isLoading={loading} 
            onSubmit={onSubmit}
          />
        </div>
        {loading && messages.length === 0 && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {messages.length === 0 && !loading && (
          <Empty label="No conversation started." />
        )}
        <div className="space-y-4 mt-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={cn(
                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                message.role === 'user' 
                  ? 'bg-white border border-black/10' 
                  : darkMode ? 'bg-gray-800' : 'bg-gray-100'
              )}
            >
              {message.role === 'user' ? <UserAvatar /> : <BotAvatar />}
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
