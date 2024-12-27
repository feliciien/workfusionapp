"use client";

import { FC, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import { MAX_FREE_COUNTS, FREE_CONTENT_WORD_LIMIT, FREE_IDEA_LIMIT } from "@/constants";
import { Zap, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface FreeCounterProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const FreeCounter: FC<FreeCounterProps> = ({ apiLimitCount: initialCount = 0, isPro = false }) => {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/api-limit');
        const data = await response.json();
        setCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch API limit count:', error);
      }
    };

    if (mounted && !isPro) {
      fetchCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, isPro]);

  if (!mounted) {
    return null;
  }

  if (isPro) {
    return null;
  }

  const usagePercentage = (count / MAX_FREE_COUNTS) * 100;
  const remainingGenerations = MAX_FREE_COUNTS - count;

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <p className="font-medium">
                {count} / {MAX_FREE_COUNTS} Free Generations
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <p>Free Tier Limits:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>{MAX_FREE_COUNTS} AI generations</li>
                      <li>{FREE_CONTENT_WORD_LIMIT} words per content</li>
                      <li>{FREE_IDEA_LIMIT} ideas per request</li>
                      <li>Basic templates and styles</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
          <Button onClick={() => router.push('/settings')} variant="premium" className="w-full">
            Upgrade
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
      <Analytics />
    </div>
  );
};

export default FreeCounter;
