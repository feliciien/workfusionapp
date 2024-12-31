"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SubscriptionHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSubscriptionCallback = async () => {
      if (!searchParams) return;
      
      const subscriptionId = searchParams.get("subscription_id");
      if (!subscriptionId) return;

      try {
        const response = await axios.post("/api/paypal/capture-subscription", {
          subscriptionId,
        });

        if (response.data.success) {
          toast.success("Subscription activated successfully!");
        } else {
          throw new Error(response.data.error || "Failed to activate subscription");
        }
      } catch (error) {
        console.error("Subscription Capture Error:", error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("An error occurred while activating your subscription");
        }
      }
    };

    handleSubscriptionCallback();
  }, [searchParams]);

  return null;
}
