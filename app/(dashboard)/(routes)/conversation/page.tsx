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
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
  id?: string;
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
  const [retrying, setRetrying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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

  const onSubmit = async (values: z.infer<typeof formSchema>, retryCount = 0) => {
    try {
      setLoading(true);
      setShowUpgrade(false);
      setIsTyping(true);

      const messageId = Date.now().toString();
      const userMessage: Message = {
        role: 'user',
        content: values.prompt,
        timestamp: new Date(),
        status: 'sending',
        id: messageId,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const response = await axios.post('/api/conversation', {
        messages: newMessages,
        conversationId,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: typeof response.data === 'string' 
          ? response.data 
          : response.data.content || response.data.text || '',
        timestamp: new Date(),
        status: 'sent',
        id: Date.now().toString(),
      };

      setMessages((current) => 
        current.map(msg => msg.id === messageId ? { ...msg, status: 'sent' as const } : msg)
        .concat([assistantMessage])
      );

    } catch (error: any) {
      if (retryCount < 2) {
        setRetrying(true);
        setTimeout(() => {
          onSubmit(values, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setShowUpgrade(true);
        toast.error("Free trial limit reached. Please upgrade to continue.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error('[CONVERSATION_ERROR]', error);
      
      setMessages((current) =>
        current.map(msg => 
          msg.status === 'sending' ? { ...msg, status: 'error' as const } : msg
        )
      );
    } finally {
      setLoading(false);
      setIsTyping(false);
      setRetrying(false);
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
      
      <div className="px-4 lg:px-8">
        <div>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            className="mb-4 ml-2"
            onClick={clearConversation}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 rounded-lg bg-slate-100 dark:bg-slate-900">
          {messages.length === 0 && !loading && (
            <Empty label="No conversation started." />
          )}
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div 
                key={message.id || index}
                className={cn(
                  "p-4 w-full flex items-start gap-x-4 rounded-lg",
                  message.role === "user" ? "bg-white dark:bg-slate-800" : "bg-violet-500/10",
                  message.status === 'error' && "border-red-500 border"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <div className="flex flex-col flex-1">
                  <p className="text-sm">
                    {message.content}
                  </p>
                  {message.timestamp && (
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                  {message.status === 'error' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSubmit({ prompt: message.content })}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
            ))}
            {isTyping && (
              <div className="p-4 rounded-lg bg-violet-500/10 animate-pulse">
                <p className="text-sm">AI is typing...</p>
              </div>
            )}
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