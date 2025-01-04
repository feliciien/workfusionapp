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
  const [error, setError] = useState<string | null>(null);

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

  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setError(null);

      const userMessage: Message = {
        role: 'user',
        content: values.prompt,
        timestamp: new Date(),
        status: 'sending',
        id: generateMessageId(),
      };

      console.log('Sending message:', { userMessage });
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const response = await axios.post('/api/conversation', {
        messages: newMessages.map(({ role, content }) => ({
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

      console.log('Received response:', response.data);

      // Update user message status to sent
      setMessages(current => 
        current.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      if (response.data.messages) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.messages[response.data.messages.length - 1].content,
          timestamp: new Date(),
          status: 'sent',
          id: generateMessageId(),
        };

        setMessages(current => [...current, assistantMessage]);

        // Update URL if new conversation
        if (!conversationId && response.data.id) {
          router.push(`/conversation?id=${response.data.id}`);
        }
      } else if (response.data.message) {
        // Handle single message response
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message.content,
          timestamp: new Date(),
          status: 'sent',
          id: generateMessageId(),
        };

        setMessages(current => [...current, assistantMessage]);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }

    } catch (error: any) {
      console.error('[CONVERSATION_ERROR]', error);
      
      // Update user message status to error
      setMessages(current => 
        current.map(msg => 
          msg.status === 'sending' ? { ...msg, status: 'error' } : msg
        )
      );

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Axios error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage
        });

        if (error.response?.status === 403) {
          toast.error("Free trial limit reached. Please upgrade to continue.");
        } else if (error.code === 'ECONNABORTED') {
          toast.error("Request timed out. Please try again.");
        } else {
          toast.error(errorMessage || "Failed to send message");
        }
      } else {
        console.error('Non-Axios error:', error);
        toast.error("An unexpected error occurred");
      }
      
      setError("Failed to send message. Please try again.");
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
    <div>
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form
            schema={formSchema}
            onSubmit={onSubmit}
          />
          <div className="space-y-4 mt-4">
            {messages.length === 0 && !loading && (
              <Empty label="No conversation started." />
            )}
            <div className="flex flex-col-reverse gap-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id || message.content}
                  className={cn(
                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                    message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      message.status === 'error' && "text-red-500"
                    )}>
                      {message.content}
                    </p>
                    {message.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">
                        Failed to send. Please try again.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {loading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                <Loader />
              </div>
            )}
            {error && (
              <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
          >
            <Trash className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
