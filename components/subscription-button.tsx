"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

declare global {
  interface Window {
    paypal?: any;
  }
}

const MONTHLY_BUTTON_ID = 'paypal-monthly-button';
const YEARLY_BUTTON_ID = 'paypal-yearly-button';

interface SubscriptionButtonProps {
  isPro: boolean;
}

export const SubscriptionButton = ({ isPro = false }: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
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
            label: 'subscribe'
          },
          createSubscription: async (data: any, actions: any) => {
            try {
              const response = await axios.get("/api/paypal/create-subscription?plan=monthly");
              return actions.subscription.create({
                plan_id: response.data.planId
              });
            } catch (error) {
              console.error("Error creating subscription:", error);
              toast.error("Failed to create subscription");
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              setLoading(true);
              await axios.post('/api/paypal/capture-subscription', {
                subscriptionId: data.subscriptionID
              });
              toast.success("Successfully subscribed!");
              window.location.reload();
            } catch (error) {
              console.error("Error capturing subscription:", error);
              toast.error("Failed to activate subscription");
            } finally {
              setLoading(false);
            }
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            toast.error("Payment failed. Please try again.");
          }
        }).render(`#${MONTHLY_BUTTON_ID}`);

        // Yearly subscription button
        window.paypal.Buttons({
          style: {
            label: 'subscribe'
          },
          createSubscription: async (data: any, actions: any) => {
            try {
              const response = await axios.get("/api/paypal/create-subscription?plan=yearly");
              return actions.subscription.create({
                plan_id: response.data.planId
              });
            } catch (error) {
              console.error("Error creating subscription:", error);
              toast.error("Failed to create subscription");
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              setLoading(true);
              await axios.post('/api/paypal/capture-subscription', {
                subscriptionId: data.subscriptionID
              });
              toast.success("Successfully subscribed!");
              window.location.reload();
            } catch (error) {
              console.error("Error capturing subscription:", error);
              toast.error("Failed to activate subscription");
            } finally {
              setLoading(false);
            }
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            toast.error("Payment failed. Please try again.");
          }
        }).render(`#${YEARLY_BUTTON_ID}`);
      } catch (error) {
        console.error("Error rendering PayPal buttons:", error);
        toast.error("Failed to load payment options");
      }
    };

    loadPayPalScript();

    return () => {
      const script = document.querySelector('script[src*="paypal"]');
      if (script) {
        script.remove();
      }
    };
  }, [isPro, scriptLoaded]);

  if (isPro) {
    return (
      <Button disabled={true} variant="premium" className="w-full">
        <Zap className="w-4 h-4 ml-2 fill-white" />
        You are a Pro user
      </Button>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">Monthly Plan</h3>
        <p className="text-muted-foreground mb-4">$10/month - Unlimited access</p>
        <div id={MONTHLY_BUTTON_ID} className="w-full" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-4">Yearly Plan</h3>
        <p className="text-muted-foreground mb-4">$100/year - Save 17%</p>
        <div id={YEARLY_BUTTON_ID} className="w-full" />
      </div>
    </div>
  );
};