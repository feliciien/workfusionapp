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
          renderButtons();
        };

        script.onerror = (error) => {
          console.error("PayPal script failed to load:", error);
          toast.error("Failed to load payment system");
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading PayPal:", error);
        toast.error("Something went wrong loading the payment system");
      } finally {
        setLoading(false);
      }
    };

    const renderButtons = () => {
      if (!window.paypal) return;

      try {
        // Monthly subscription button
        window.paypal.Buttons({
          style: {
            label: 'subscribe',
            layout: 'vertical',
            shape: 'rect'
          },
          createSubscription: async (data: any, actions: any) => {
            try {
              return actions.subscription.create({
                plan_id: PLAN_DETAILS.monthly.plan_id
              });
            } catch (error) {
              console.error("Error creating subscription:", error);
              toast.error("Failed to create subscription");
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              toast.success("Successfully subscribed! Redirecting to dashboard...");
              router.push("/dashboard");
            } catch (error) {
              console.error("Error handling subscription approval:", error);
              toast.error("Error finalizing subscription");
            }
          },
          onError: (error: any) => {
            console.error("PayPal Error:", error);
            toast.error("Payment failed. Please try again.");
          }
        }).render(`#${MONTHLY_BUTTON_ID}`);

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
                plan_id: PLAN_DETAILS.yearly.plan_id
              });
            } catch (error) {
              console.error("Error creating subscription:", error);
              toast.error("Failed to create subscription");
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              toast.success("Successfully subscribed! Redirecting to dashboard...");
              router.push("/dashboard");
            } catch (error) {
              console.error("Error handling subscription approval:", error);
              toast.error("Error finalizing subscription");
            }
          },
          onError: (error: any) => {
            console.error("PayPal Error:", error);
            toast.error("Payment failed. Please try again.");
          }
        }).render(`#${YEARLY_BUTTON_ID}`);
      } catch (error) {
        console.error("Error rendering PayPal buttons:", error);
        toast.error("Failed to initialize payment system");
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
      <div id={MONTHLY_BUTTON_ID} />
      <div id={YEARLY_BUTTON_ID} />
    </div>
  );
};