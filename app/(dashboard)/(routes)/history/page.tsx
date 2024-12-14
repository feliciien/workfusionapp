"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import axios from "axios";
import format from "date-fns/format";
import { Loader } from "@/components/loader";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/conversation/history');
        const formattedConversations = response.data.map((conv: any) => ({
          ...conv,
          timestamp: format(new Date(conv.timestamp), 'MMM d, yyyy HH:mm'),
        }));
        setConversations(formattedConversations);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const navigateToConversation = (conversationId: string) => {
    router.push(`/conversation?id=${conversationId}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Conversation History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            className={cn(
              "p-4 border-black/5 flex flex-col hover:shadow-md transition cursor-pointer",
              "bg-gray-900 text-white"
            )}
            onClick={() => navigateToConversation(conversation.id)}
          >
            <div className="flex items-center gap-x-2">
              <MessageSquare className="w-8 h-8 text-violet-500" />
              <div className="font-semibold">{conversation.title}</div>
            </div>
            <p className="text-xs text-zinc-400 mt-2">{conversation.timestamp}</p>
            <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{conversation.preview}</p>
          </Card>
        ))}
      </div>
      {conversations.length === 0 && !loading && (
        <div className="text-center text-zinc-400 mt-10">
          No conversation history yet. Start a new conversation to see it here!
        </div>
      )}
    </div>
  );
}
