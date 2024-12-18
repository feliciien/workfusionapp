"use client";

import { ArrowRight, Search, Star, Clock, BarChart2 } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { tools } from "./config";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Tool {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
  bgColor: string;
  color: string;
}

interface UsageStats {
  used: number;
  total: number;
  lastUsed?: string;
  dailyUsage: number[];
  popularTools: string[];
  efficiency: number;
  responseTime: number[];
  successRate: number;
  aiAccuracy: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    total: 100,
    dailyUsage: Array(7).fill(0),
    popularTools: [],
    efficiency: 0,
    responseTime: Array(7).fill(0),
    successRate: 85,
    aiAccuracy: 92
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate loading data
        const mockData = {
          used: 45,
          total: 100,
          dailyUsage: [12, 15, 8, 20, 18, 25, 30],
          popularTools: ['Conversation', 'Image Generation', 'Code'],
          efficiency: 85,
          responseTime: [1.2, 1.5, 1.8, 2.1, 2.3, 2.5, 2.8],
          successRate: 85,
          aiAccuracy: 92
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

  // Filter tools based on search query
  const filteredTools = tools.filter(tool => 
    tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle favorite status
  const toggleFavorite = (toolHref: string) => {
    setFavorites(prev => 
      prev.includes(toolHref) 
        ? prev.filter(href => href !== toolHref)
        : [...prev, toolHref]
    );
  };

  return (
    <main className="flex-1 p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl md:text-4xl font-bold text-center">
          AI Tools Dashboard
        </h1>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Experience the power of AI with our comprehensive suite of tools
        </p>
      </div>

      {/* Search and Stats Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 col-span-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      </div>

      {/* Analytics Section */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Success Rate</p>
            <h3 className="text-2xl font-bold">{usageStats.successRate}%</h3>
          </div>
          <Progress value={usageStats.successRate} className="mt-4" />
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">AI Accuracy</p>
            <h3 className="text-2xl font-bold">{usageStats.aiAccuracy}%</h3>
          </div>
          <Progress value={usageStats.aiAccuracy} className="mt-4" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Avg Response Time</p>
            <h3 className="text-2xl font-bold">
              {(usageStats.responseTime.reduce((a, b) => a + b, 0) / usageStats.responseTime.length).toFixed(2)}s
            </h3>
          </div>
        </Card>
      </div>

      {/* Quick Access Section */}
      {favorites.length > 0 && (
        <section className="mb-8" aria-label="Favorite Tools">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools
              .filter(tool => favorites.includes(tool.href))
              .map(tool => (
                <Card
                  key={tool.href}
                  className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
                  onClick={() => router.push(tool.href)}
                >
                  <div className="flex items-center gap-x-4">
                    <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                      <tool.icon className={cn("w-6 h-6", tool.color)} />
                    </div>
                    <span className="font-medium">{tool.label}</span>
                  </div>
                  <Star 
                    className={cn("w-5 h-5", favorites.includes(tool.href) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(tool.href);
                    }}
                  />
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* Main Tools Navigation */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((_, index) => (
            <section key={index} aria-label="Loading...">
              <h2 className="text-xl font-semibold mb-4">Loading...</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((_, index) => (
                  <Card
                    key={index}
                    className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer group"
                    role="link"
                    tabIndex={0}
                    aria-label="Loading..."
                  >
                    <div className="flex items-center gap-x-4">
                      <div className="p-2 w-fit rounded-md bg-gray-200 animate-pulse"></div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold animate-pulse bg-gray-200 h-4 w-24"></h3>
                        <p className="text-sm text-muted-foreground animate-pulse bg-gray-200 h-4 w-48"></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gray-300" />
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <nav aria-label="AI Tools Navigation">
          <div className="space-y-8">
            {Object.entries(
              filteredTools.reduce((acc, tool) => {
                if (!acc[tool.category]) {
                  acc[tool.category] = [];
                }
                acc[tool.category].push(tool);
                return acc;
              }, {} as Record<string, Tool[]>)
            ).map(([category, categoryTools]) => (
              <section key={category} aria-label={`${category} Tools`}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map((tool) => (
                    <Card
                      key={tool.href}
                      onClick={() => router.push(tool.href)}
                      className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer group"
                      role="link"
                      tabIndex={0}
                      aria-label={`${tool.label} - ${tool.description}`}
                    >
                      <div className="flex items-center gap-x-4">
                        <div className={cn("p-2 w-fit rounded-md transition-colors", tool.bgColor, "group-hover:bg-opacity-70")}>
                          <tool.icon className={cn("w-8 h-8", tool.color)} />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-semibold">{tool.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star 
                          className={cn("w-5 h-5", favorites.includes(tool.href) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(tool.href);
                          }}
                        />
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </nav>
      )}

      <Analytics />
    </main>
  );
}
