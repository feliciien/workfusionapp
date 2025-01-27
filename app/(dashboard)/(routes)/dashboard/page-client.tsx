"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProModal } from "@/hooks/use-pro-modal";
import { useSubscription } from "@/hooks/use-subscription";
import { cn, groupBy } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { Clock, LucideIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tools } from "./config";

interface Tool {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  bgColor: string;
  color: string;
  limitedFree?: boolean;
  freeLimit?: number;
  proOnly?: boolean;
  featureType?: string;
}

interface UsageStats {
  used: number;
  total: number;
  lastUsed?: string;
  dailyUsage: number[];
  popularTools: string[];
  efficiency: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const proModal = useProModal();
  const { isPro } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    total: 100,
    dailyUsage: Array(7).fill(0),
    popularTools: [],
    efficiency: 0
  });

  const handleToolClick = (tool: Tool) => {
    if (tool.proOnly && !isPro) {
      proModal.setSelectedTool(tool);
      proModal.onOpen();
    } else {
      router.push(tool.href);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const mockData = {
          used: 45,
          total: 100,
          dailyUsage: [12, 15, 8, 20, 18, 25, 30],
          popularTools: ['Conversation', 'Image Generation', 'Code'],
          efficiency: 85
        };
        setUsageStats(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredTools = tools.filter(tool => 
    tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto">
      <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
              <div className="flex items-center gap-x-2 font-bold py-1">
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                  Upgrade to Pro
                </span>
                <Badge variant="premium" className="uppercase text-sm py-1">pro</Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
              {proModal.selectedTool && (
                <div className="flex items-center justify-center flex-col space-y-4">
                  <div className={cn("p-3 rounded-xl", proModal.selectedTool.bgColor)}>
                    <proModal.selectedTool.icon className={cn("w-12 h-12", proModal.selectedTool.color)} />
                  </div>
                  <div className="text-xl font-semibold">{proModal.selectedTool.label}</div>
                  <p className="text-sm text-muted-foreground">{proModal.selectedTool.description}</p>
                </div>
              )}
              <p className="text-sm font-normal">Upgrade to Pro to unlock all premium features and tools.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="lg"
              variant="premium"
              className="w-full"
              onClick={() => {
                router.push("/settings");
                proModal.onClose();
              }}
            >
              Upgrade to Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
        AI Tools Dashboard
      </h1>
      <p className="text-lg text-muted-foreground text-center mb-4">
        Experience the power of AI with our comprehensive suite of tools
      </p>

      <div className="mb-8 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-10 h-12 bg-white/80 dark:bg-gray-950/50 backdrop-blur-sm border-0 ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 mt-4 justify-center">
              {["All", "Free", "Pro", "Popular"].map((filter) => (
                <Button
                  key={filter}
                  variant="outline"
                  size="sm"
                  className="bg-white/50 dark:bg-gray-900/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupBy(filteredTools, "featureType")).map(([featureType, tools]) => (
          <div key={featureType} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{featureType}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Card
                  key={tool.href}
                  className={cn(
                    "group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300",
                    tool.proOnly && !isPro && "opacity-90 hover:opacity-100 cursor-not-allowed"
                  )}
                  onClick={() => handleToolClick(tool)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-900/50" />
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                          tool.bgColor,
                          "bg-opacity-50 backdrop-blur-sm"
                        )}
                      >
                        <tool.icon className={cn("w-6 h-6", tool.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold truncate">{tool.label}</h3>
                          {tool.proOnly ? (
                            <Badge variant="premium" className="animate-shimmer">Pro</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                              Free
                            </Badge>
                          )}
                        </div>
                        {tool.limitedFree && tool.freeLimit && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tool.freeLimit}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Analytics />
    </main>
  );
}
