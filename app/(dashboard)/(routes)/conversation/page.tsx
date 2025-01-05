"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { MessageSquare, Moon, Sun, Trash, ClipboardCopy } from "lucide-react";
import { Heading } from "@/components/heading";
import { useSession } from "next-auth/react";

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

type FormValues = z.infer<typeof formSchema>;

export default function ConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get('id');
  const session = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [title, setTitle] = useState<string>("New Conversation");

  // Store messages in local storage
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`conversation-${conversationId}`, JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  // Load messages from local storage
  useEffect(() => {
    if (conversationId) {
      const savedMessages = localStorage.getItem(`conversation-${conversationId}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (e) {
          console.error('Error loading saved messages:', e);
        }
      }
    }
  }, [conversationId]);

  // Dark mode persistence
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleRetry = async () => {
    if (messages.length === 0) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setRetrying(true);
    try {
      await onSubmit({ prompt: lastUserMessage.content });
    } finally {
      setRetrying(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (loading || isTyping) return;

    const prompt = values.prompt.trim();
    if (!prompt) return;

    try {
      setLoading(true);
      setShowUpgrade(false);
      setIsTyping(true);
      setError(null);

      const messageId = generateMessageId();
      const userMessage: Message = {
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        status: 'sending',
        id: messageId,
      };

      // Optimistically add user message
      setMessages((current) => [...current, userMessage]);
      form.reset();

      const response = await axios.post<{ conversationId: string; message: Message }>("/api/conversation", {
        messages: [...messages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
        conversationId,
      }, {
        timeout: 60000, // 1 minute timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update user message status to sent
      setMessages((current) => 
        current.map((msg) => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        )
      );

      // Add assistant's response
      if (response.data.message) {
        setMessages((current) => [
          ...current,
          {
            ...response.data.message,
            timestamp: new Date(),
            status: 'sent',
            id: generateMessageId(),
          },
        ]);

        // Update conversation title if it's a new conversation
        if (!title || title === "New Conversation") {
          setTitle(prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''));
        }
      }

      // Update conversation ID in URL if this is a new conversation
      if (!conversationId && response.data.conversationId) {
        router.push(`/conversation?id=${response.data.conversationId}`, { scroll: false });
      }

    } catch (error) {
      console.error('Conversation error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setShowUpgrade(true);
          toast.error("You've reached your limit. Please upgrade to continue.");
        } else if (error.code === 'ECONNABORTED') {
          toast.error("Request timed out. Please try again.");
        } else {
          toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      // Mark the last message as error
      setMessages((current) => {
        const lastMessage = current[current.length - 1];
        return lastMessage
          ? current.map((msg) =>
              msg.id === lastMessage.id
                ? { ...msg, status: 'error' }
                : msg
            )
          : current;
      });

    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    if (conversationId) {
      localStorage.removeItem(`conversation-${conversationId}`);
    }
    setMessages([]);
    setTitle("New Conversation");
    router.push('/conversation', { scroll: false });
  };

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
      setTitle(response.data.title || "New Conversation");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
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
          title={title}
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          disabled={loading}
                          placeholder="Type a message..."
                          {...field}
                          className={cn(
                            "w-full pr-12 focus:outline-none focus:ring-2 focus:ring-offset-2",
                            loading && "opacity-50 cursor-not-allowed"
                          )}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                        {loading && (
                          <div className="absolute right-3 top-3">
                            <Loader />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {form.formState.errors.prompt && (
                      <div className="text-xs text-red-500 mt-1">
                        {form.formState.errors.prompt.message}
                      </div>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  disabled={loading || messages.length === 0}
                >
                  Retry Last Message
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={cn(
                    "bg-primary hover:bg-primary/90",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Send Message
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {showUpgrade && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-xl shadow-lg border z-50">
          <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;ve reached your free trial limit. Upgrade to continue using the AI conversation feature.
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