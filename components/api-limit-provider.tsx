"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import React from "react";

interface ApiLimitProviderProps {
  children: React.ReactNode;
}

export const ApiLimitProvider = ({ children }: ApiLimitProviderProps) => {
  const [apiLimitCount, setApiLimitCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const { data: session, status } = useSession();

  const isSignedIn = status === "authenticated";

  useEffect(() => {
    const fetchLimits = async () => {
      if (!isSignedIn) return;

      try {
        // Fetch API limit count
        const apiLimitResponse = await fetch("/api/api-limit");
        const apiLimitData = await apiLimitResponse.json();
        setApiLimitCount(apiLimitData.apiLimitCount);

        // Fetch subscription status
        const subscriptionResponse = await fetch("/api/subscription");
        const subscriptionData = await subscriptionResponse.json();
        setIsPro(subscriptionData.isPro);
      } catch (error) {
        console.error("Error fetching API limits:", error);
      }
    };

    fetchLimits();
  }, [isSignedIn]);

  return (
    <div>
      {children}
    </div>
  );
};
