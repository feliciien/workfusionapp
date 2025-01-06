"use client";

import { FC, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import { MAX_FREE_COUNTS } from "@/constants";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

export const FreeCounter: FC<FreeCounterProps> = ({ 
  apiLimitCount = 0,
  isPro = false 
}) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) {
    return null;
  }

  if (isPro) {
    return (
      <div className="px-3">
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
          <CardContent className="py-6">
            <div className="text-sm text-center text-white mb-4 space-y-2">
              <p className="font-semibold">Pro Plan Active</p>
              <p className="text-xs opacity-80">Unlimited access to all features</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-sm text-center text-white mb-4 space-y-2">
            <p className="font-semibold">Free Plan</p>
            <p>
              {apiLimitCount} / {MAX_FREE_COUNTS} Free Credits Used
            </p>
            <Progress 
              className="h-3"
              value={(apiLimitCount / MAX_FREE_COUNTS) * 100} 
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => router.push('/settings')} 
                  variant="premium" 
                  className="w-full"
                >
                  Upgrade to Pro
                  <Zap className="w-4 h-4 ml-2 fill-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm p-2">
                  <p className="font-semibold">Start 14-Day Free Trial</p>
                  <p className="text-gray-400 mt-1">Get unlimited access to all features!</p>
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
