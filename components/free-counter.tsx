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
  apiLimits: {
    [key: string]: number;
  };
  isPro: boolean;
}

export const FreeCounter: FC<FreeCounterProps> = ({ 
  apiLimits = {},
  isPro = false 
}) => {
  const [mounted, setMounted] = useState(false);
  const [limits, setLimits] = useState(apiLimits);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch('/api/api-limit');
        const data = await response.json();
        setLimits(data.limits || {});
      } catch (error) {
        console.error('Failed to fetch API limits:', error);
      }
    };

    if (mounted && !isPro) {
      fetchLimits();
      // Refresh limits every 30 seconds
      const interval = setInterval(fetchLimits, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, isPro]);

  if (!mounted || !isSignedIn) {
    return null;
  }

  if (isPro) {
    return null;
  }

  // Calculate total usage and limit
  const totalUsage = Object.values(limits).reduce((sum, count) => sum + (count || 0), 0);
  const totalLimit = Object.values(MAX_FREE_COUNTS).reduce((sum, limit) => sum + limit, 0);

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-sm text-center text-white mb-4 space-y-2">
            <p>
              {totalUsage} / {totalLimit} Free Credits Used
            </p>
            <Progress
              className="h-3"
              value={(totalUsage / totalLimit) * 100}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => router.push('/pro')} variant="premium" className="w-full">
                  Upgrade
                  <Zap className="w-4 h-4 ml-2 fill-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>Upgrade to WorkFusion Pro to:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Remove all usage limits</li>
                    <li>Access premium features</li>
                    <li>Priority support</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
      <Analytics />
    </div>
  );
};

export default FreeCounter;
