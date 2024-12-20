"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Heading } from "@/components/heading";
import { MessageSquare, Moon, Sun, Trash, Zap } from "lucide-react";
import { Form } from "@/components/form";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
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

export default function ConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Only run client-side
  useEffect(() => {
    setMounted(true);
    // Check for system dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (conversationId && mounted) {
      loadConversation(conversationId);
    }
  }, [conversationId, mounted]);

  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  const loadConversation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/conversation/${id}`);
      const formattedMessages = response.data.messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content.text || '',
      }));
      setMessages(formattedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setShowUpgrade(false);

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

      const assistantMessage = {
        role: 'assistant' as const,
        content: typeof response.data === 'string' 
          ? response.data 
          : response.data.content || response.data.text || '',
      };

      setMessages((current) => [...current, assistantMessage]);

    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setShowUpgrade(true);
        toast.error("Free trial limit reached. Please upgrade to continue.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error('[CONVERSATION_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    router.refresh();
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="px-4 lg:px-8">
        <Heading
          title="Error"
          description={error}
          icon={MessageSquare}
          iconColor="text-red-500"
          bgColor="bg-red-500/10"
        />
      </div>
    );
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
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className={cn(
              "p-2 rounded-lg transition-colors",
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
            )}
          >
            <Trash className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="px-4 lg:px-8">
        <div>
          {messages.length === 0 && !loading && (
            <Empty label="No conversation started." />
          )}
          <div className="space-y-4 mt-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted",
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
        {showUpgrade && (
          <div className="p-8 rounded-lg bg-amber-100 mt-4">
            <div className="flex items-center gap-x-4">
              <Zap className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="text-lg font-bold text-amber-600">Free Trial Limit Reached</h3>
                <p className="text-sm text-amber-600">
                  Upgrade to our pro plan to continue using the conversation feature.
                </p>
              </div>
              <Button 
                variant="premium"
                className="ml-auto"
                onClick={() => router.push('/settings')}
              >
                Upgrade to Pro
                <Zap className="w-4 h-4 ml-2 fill-white" />
              </Button>
            </div>
          </div>
        )}
        <div className="mt-4">
          <Form
            isLoading={loading}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}