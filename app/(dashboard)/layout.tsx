"use client";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { useEffect, useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import SubscriptionHandler from "@/components/subscription-handler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const count = await getApiLimitCount();
        const proStatus = await checkSubscription();
        setApiLimitCount(count);
        setIsPro(proStatus);
      } catch (error) {
        console.error("Error fetching limits:", error);
      }
    };

    fetchLimits();
  }, []);

  return (
    <div className="h-full relative">
      <SubscriptionHandler />
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </div>
      <main className="md:pl-72 pb-10">
        <Navbar />
        {children}
        <Analytics />
      </main>
    </div>
  );
}
