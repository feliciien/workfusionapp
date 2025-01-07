"use client";

import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, CreditCard } from "lucide-react";
import { updateSubscriptionStatus } from "@/app/actions/subscription";

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

  const handleSubscribe = () => {
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !planId) {
      console.error("Missing configuration:", {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? "present" : "missing",
        planId: planId ? "present" : "missing"
      });
      toast.error("Payment system is not properly configured. Please try again later.");
      return;
    }
    setShowPayPal(true);
  };

  const createSubscription = async (data: any, actions: any) => {
    try {
      if (!planId) {
        throw new Error("Subscription plan not configured");
      }

      const subscription = await actions.subscription.create({
        plan_id: planId,
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      });

      if (subscription.id) {
        await updateSubscriptionStatus(subscription.id, "active");
        toast.success("Subscription created successfully!");
        return subscription.id;
      }
      
      throw new Error("Failed to create subscription");
    } catch (error) {
      console.error("Subscription creation error:", error);
      toast.error("Failed to create subscription. Please try again.");
      return null;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      setLoading(true);
      await updateSubscriptionStatus(data.subscriptionID, "active");
      toast.success("Thanks for subscribing!");
      window.location.reload();
    } catch (error) {
      console.error("Subscription approval error:", error);
      toast.error("Something went wrong. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onError = (err: any) => {
    console.error("PayPal error:", err);
    toast.error("Payment failed. Please try again.");
    setLoading(false);
  };

  if (loading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isPro) {
    return (
      <Button disabled className="w-full">
        <CreditCard className="w-4 h-4 mr-2" />
        You are already subscribed
      </Button>
    );
  }

  return (
    <div className="w-full space-y-4">
      {!showPayPal && (
        <Button
          onClick={handleSubscribe}
          className="w-full"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {planType === "monthly" ? "Subscribe Monthly" : "Subscribe Yearly"}
        </Button>
      )}
      
      {showPayPal && (
        <div className="w-full p-4 bg-white rounded-lg">
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect" }}
            createSubscription={createSubscription}
            onApprove={onApprove}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
};