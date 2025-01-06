"use client";

import { useState, useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2, CreditCard } from "lucide-react";

interface SubscriptionButtonProps {
  isPro: boolean;
  planType: "monthly" | "yearly";
}

export const SubscriptionButton = ({
  isPro,
  planType,
}: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);

  const planId = planType === "monthly" 
    ? process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID 
    : process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID;

  useEffect(() => {
    // Log environment variables (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Client ID:", process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
      console.log("Plan ID:", planId);
    }
  }, [planId]);

  const handleSubscribe = () => {
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !planId) {
      console.error({
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        planId: planId
      });
      toast.error("PayPal configuration is missing. Please contact support.");
      return;
    }
    setShowPayPal(true);
  };

  const createSubscription = (data: any, actions: any) => {
    console.log("Creating subscription with plan ID:", planId);
    if (!planId) {
      toast.error("Subscription plan not configured");
      return Promise.reject("Plan ID not configured");
    }

    return actions.subscription.create({
      'plan_id': planId,
      'application_context': {
        'shipping_preference': 'NO_SHIPPING',
        'user_action': 'SUBSCRIBE_NOW'
      }
    });
  };

  const onApprove = async (data: any) => {
    console.log("Subscription approved:", data);
    try {
      setLoading(true);
      
      // Verify the subscription with PayPal
      const response = await axios.post("/api/subscribe", {
        subscriptionId: data.subscriptionID,
        planType: planType,
        orderID: data.orderID
      });

      console.log("Subscription response:", response.data);
      
      if (response.data.success) {
        toast.success("Successfully subscribed! Refreshing...");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to activate subscription");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to activate subscription");
    } finally {
      setLoading(false);
    }
  };

  const onError = (err: any) => {
    console.error("PayPal error:", err);
    toast.error("PayPal error occurred. Please try again.");
    setShowPayPal(false);
  };

  const onCancel = () => {
    toast.error("Subscription cancelled");
    setShowPayPal(false);
  };

  if (isPro) {
    return (
      <Button 
        className="w-full" 
        variant="premium" 
        disabled
      >
        Current Plan
      </Button>
    );
  }

  if (loading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (!showPayPal) {
    return (
      <Button
        onClick={handleSubscribe}
        className="w-full"
        variant="premium"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {planType === "monthly" ? "Subscribe Monthly" : "Subscribe Yearly"}
      </Button>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="border rounded-lg p-4 bg-white">
        <PayPalButtons
          style={{ 
            layout: "vertical",
            shape: "rect",
            label: "subscribe"
          }}
          disabled={loading}
          createSubscription={createSubscription}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
        />
        <Button
          onClick={() => setShowPayPal(false)}
          variant="ghost"
          className="w-full mt-4"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};