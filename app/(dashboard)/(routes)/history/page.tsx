"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Heading } from "@/components/heading";
import { History } from "lucide-react";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  title: string;
  featureType: string;
  timestamp: Date;
  preview: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/conversation/history");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureIcon = (featureType: string) => {
    switch (featureType) {
      case "conversation":
        return "💬";
      case "video":
        return "🎥";
      case "music":
        return "🎵";
      case "code":
        return "💻";
      default:
        return "📝";
    }
  };

  const getFeatureRoute = (featureType: string) => {
    switch (featureType) {
      case "conversation":
        return "/conversation";
      case "video":
        return "/video";
      case "music":
        return "/music";
      case "code":
        return "/code";
      default:
        return "/conversation";
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    const route = getFeatureRoute(conversation.featureType);
    router.push(`${route}?id=${conversation.id}`);
  };

  const groupedConversations = conversations.reduce((groups, conversation) => {
    const group = groups[conversation.featureType] || [];
    group.push(conversation);
    groups[conversation.featureType] = group;
    return groups;
  }, {} as Record<string, Conversation[]>);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4">
      <Heading
        title="History"
        description="View your past conversations across all features."
        icon={History}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />

      {Object.entries(groupedConversations).length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-sm text-center">
            No conversation history yet. Start a new conversation to see it here!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedConversations).map(([featureType, conversations]) => (
            <div key={featureType} className="space-y-4">
              <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
                {getFeatureIcon(featureType)} {featureType}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={cn(
                      "p-4 border-black/5 flex flex-col hover:shadow-md transition cursor-pointer",
                      "dark:bg-gray-900/50 dark:hover:bg-gray-900/80"
                    )}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 truncate">
                        <h3 className="font-semibold truncate">{conversation.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {conversation.preview}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {format(new Date(conversation.timestamp), "MMM d, yyyy")}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
