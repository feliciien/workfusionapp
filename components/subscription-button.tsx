"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal?: any;
  }
}

const MONTHLY_BUTTON_ID = 'paypal-monthly-button';
const YEARLY_BUTTON_ID = 'paypal-yearly-button';

const PLAN_DETAILS = {
  monthly: {
    plan_id: 'P-8Y551355TK076831TM5M7OZA',
  },
  yearly: {
    plan_id: 'P-9LL83744K0141123KM5RXMMQ',
  },
};

interface SubscriptionButtonProps {
  isPro: boolean;
}

export const SubscriptionButton = ({ isPro = false }: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const router = useRouter();

  const renderButtons = () => {
    if (!window.paypal) return;

    try {
      // Monthly subscription button
      const monthlyContainer = document.getElementById(MONTHLY_BUTTON_ID);
      const yearlyContainer = document.getElementById(YEARLY_BUTTON_ID);

      if (!monthlyContainer || !yearlyContainer) {
        console.error("PayPal button containers not found");
        return;
      }

      window.paypal.Buttons({
        style: {
          label: 'subscribe',
          layout: 'vertical',
          shape: 'rect'
        },
        createSubscription: async (data: any, actions: any) => {
          try {
            return actions.subscription.create({
              plan_id: PLAN_DETAILS.monthly.plan_id,
              application_context: {
                shipping_preference: "NO_SHIPPING"
              }
            });
          } catch (error: any) {
            console.error("Error creating subscription:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Failed to create subscription");
            throw error;
          }
        },
        onApprove: async (data: any) => {
          try {
            console.log("Subscription approved:", data);
            await axios.post('/api/subscription/verify', {
              subscriptionId: data.subscriptionID
            });
            
            toast.success("Successfully subscribed! Redirecting to dashboard...");
            router.refresh();
            router.push("/dashboard");
          } catch (error: any) {
            console.error("Error handling subscription approval:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Error finalizing subscription");
          }
        },
        onError: (error: any) => {
          console.error("PayPal Error:", error?.response?.data || error);
          toast.error(error?.response?.data?.message || "Payment failed. Please try again.");
        }
      }).render(monthlyContainer);

      // Yearly subscription button
      window.paypal.Buttons({
        style: {
          label: 'subscribe',
          layout: 'vertical',
          shape: 'rect'
        },
        createSubscription: async (data: any, actions: any) => {
          try {
            return actions.subscription.create({
              plan_id: PLAN_DETAILS.yearly.plan_id,
              application_context: {
                shipping_preference: "NO_SHIPPING"
              }
            });
          } catch (error: any) {
            console.error("Error creating subscription:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Failed to create subscription");
            throw error;
          }
        },
        onApprove: async (data: any) => {
          try {
            console.log("Subscription approved:", data);
            await axios.post('/api/subscription/verify', {
              subscriptionId: data.subscriptionID
            });
            
            toast.success("Successfully subscribed! Redirecting to dashboard...");
            router.refresh();
            router.push("/dashboard");
          } catch (error: any) {
            console.error("Error handling subscription approval:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Error finalizing subscription");
          }
        },
        onError: (error: any) => {
          console.error("PayPal Error:", error?.response?.data || error);
          toast.error(error?.response?.data?.message || "Payment failed. Please try again.");
        }
      }).render(yearlyContainer);
    } catch (error: any) {
      console.error("Error rendering PayPal buttons:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to initialize payment system");
    }
  };

  useEffect(() => {
    if (isPro || scriptLoaded) return;

    const loadPayPalScript = async () => {
      try {
        setLoading(true);
        const { data: { clientId } } = await axios.get('/api/paypal/token');
        
        if (!clientId) {
          throw new Error("PayPal client ID not found");
        }

        // Remove any existing PayPal script
        const existingScript = document.querySelector('script[src*="paypal"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Load PayPal script
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&components=buttons`;
        script.async = true;
        
        script.onload = () => {
          setScriptLoaded(true);
          setTimeout(renderButtons, 0); // Ensure DOM is ready
        };

        script.onerror = (error) => {
          console.error("PayPal script failed to load:", error);
          toast.error("Failed to load payment system. Please try again.");
        };

        document.body.appendChild(script);
      } catch (error: any) {
        console.error("Error loading PayPal:", error?.response?.data || error);
        toast.error(error?.response?.data?.message || "Failed to load payment system");
      } finally {
        setLoading(false);
      }
    };

    loadPayPalScript();
  }, [isPro, scriptLoaded, router]);

  if (isPro) {
    return (
      <Button variant="premium" className="w-full" disabled>
        <Zap className="w-4 h-4 mr-2 fill-white" />
        Already Pro
      </Button>
    );
  }

  if (loading) {
    return (
      <Button variant="premium" className="w-full" disabled>
        <Zap className="w-4 h-4 mr-2 fill-white" />
        Loading...
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div id={MONTHLY_BUTTON_ID} className="w-full" />
      <div id={YEARLY_BUTTON_ID} className="w-full" />
    </div>
  );
};