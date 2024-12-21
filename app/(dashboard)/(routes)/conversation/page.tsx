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
import { ClipboardCopy } from "lucide-react";

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
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b">
        <Heading
          title="AI Conversation"
          description="Have a natural conversation with our advanced AI"
          icon={MessageSquare}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={clearConversation}
            className="rounded-full"
            disabled={messages.length === 0}
          >
            <Trash className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-4 bg-secondary/10">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Empty label="Start a conversation" />
          </div>
        )}
        <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div 
              key={message.id || index}
              className={cn(
                "flex items-start gap-x-4 rounded-xl p-4 animate-fade-in transition-all",
                message.role === "user" 
                  ? "ml-auto bg-primary text-primary-foreground max-w-[80%]" 
                  : "mr-auto bg-muted max-w-[80%]",
                message.status === 'error' && "border-2 border-destructive"
              )}
            >
              <div className={cn(
                "flex-shrink-0 rounded-full p-2",
                message.role === "user" ? "bg-primary-foreground/10" : "bg-primary/10"
              )}>
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
              </div>
              <div className="flex flex-col flex-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  {message.timestamp && (
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {message.status === 'error' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onSubmit({ prompt: message.content })}
                    className="mt-2 w-fit"
                  >
                    Retry Message
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  toast.success("Message copied to clipboard!");
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ClipboardCopy className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse mr-auto bg-muted rounded-xl p-4">
              <BotAvatar />
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-8 border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <Form
            isLoading={loading}
            onSubmit={onSubmit}
          />
        </div>
      </div>

      {showUpgrade && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-xl shadow-lg border z-50">
          <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You've reached your free trial limit. Upgrade to continue using the AI conversation feature.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowUpgrade(false)}>
              Cancel
            </Button>
            <Button onClick={() => router.push('/settings')}>
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}