"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import cn from "classnames";
import { useSearchParams } from "next/navigation";

interface SubscriptionButtonProps {
  isPro: boolean;
  planId: string;
  variant?: "default" | "outline";
  children?: React.ReactNode;
}

export const SubscriptionButton = ({
  isPro = false,
  planId,
  variant = "default",
  children
}: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifySubscription = async () => {
      const subscriptionId = searchParams.get("subscription_id");
      const success = searchParams.get("success");

      if (success === "true" && subscriptionId) {
        try {
          setLoading(true);
          await axios.get(`/api/paypal/verify?subscription_id=${subscriptionId}`);
          toast.success("Thank you for subscribing!");
          window.location.href = "/dashboard";
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Failed to verify subscription");
        } finally {
          setLoading(false);
        }
      }
    };

    verifySubscription();
  }, [searchParams]);

  const onClick = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/paypal/subscription?planId=${planId}`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong with the subscription process");
    } finally {
      setLoading(false);
    }
  };

  if (isPro) {
    return (
      <Button variant={variant} className="w-full" disabled>
        {children || (
          <>
            <Zap className="w-4 h-4 mr-2 fill-white" />
            Already Pro
          </>
        )}
      </Button>
    );
  }

  return (
    <Button 
      onClick={onClick} 
      disabled={loading} 
      variant={variant}
      className={cn(
        "w-full",
        variant === "default" && "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
      )}
    >
      {loading ? (
        <>
          <Zap className="w-4 h-4 mr-2 fill-white animate-pulse" />
          Loading...
        </>
      ) : children || (
        <>
          Upgrade to Pro
          <Zap className="w-4 h-4 ml-2 fill-white" />
        </>
      )}
    </Button>
  );
};