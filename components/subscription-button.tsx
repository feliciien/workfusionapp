"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

declare global {
  interface Window {
    paypal: {
      Buttons: (config: PayPalButtonsConfig) => { render: (containerId: string) => void };
    };
  }
}

interface PayPalButtonsConfig {
  style: {
    shape: string;
    color: string;
    layout: string;
    label: string;
  };
  createSubscription: (data: unknown, actions: {
    subscription: {
      create: (data: { plan_id: string }) => Promise<string>;
    };
  }) => Promise<string>;
  onApprove: (data: { subscriptionID: string }, actions: unknown) => void;
  onError: (err: Error) => void;
}

interface SubscriptionButtonProps {
  isPro: boolean;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ isPro = false }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPro) return;

    const loadPayPalScript = async () => {
      try {
        // Remove any existing PayPal script
        const existingScript = document.querySelector('script[src*="paypal"]');
        if (existingScript) {
          existingScript.remove();
        }

        const response = await axios.get('/api/paypal/client-token');
        const clientId = response.data.clientId;

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        
        script.onload = () => {
          renderPayPalButtons();
        };
        
        script.onerror = () => {
          console.error("Failed to load PayPal SDK");
          toast.error("Failed to load PayPal SDK. Please refresh the page.");
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading PayPal client token:", error);
        toast.error("Failed to initialize PayPal. Please try again later.");
      }
    };

    const renderPayPalButtons = () => {
      // Monthly Plan Button
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async (data, actions) => {
          try {
            setLoading(true);
            const response = await axios.get("/api/paypal/create-subscription");
            const { planId } = response.data;
            
            if (!planId) {
              throw new Error("No plan ID received");
            }

            return actions.subscription.create({
              plan_id: planId
            });
          } catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
              toast.error(error.response.data.error);
            } else {
              toast.error("Something went wrong");
            }
            throw error;
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data) => {
          try {
            setLoading(true);
            await axios.post('/api/paypal/capture-subscription', {
              subscriptionId: data.subscriptionID
            });
            
            toast.success("Successfully subscribed!");
            window.location.href = '/dashboard';
          } catch (error) {
            console.error("Error capturing subscription:", error);
            toast.error("Failed to activate subscription. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error("PayPal Buttons Error:", err);
          toast.error("An error occurred during the subscription process.");
          setLoading(false);
        }
      }).render('#paypal-button-container-monthly');

      // Yearly Plan Button
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async (data, actions) => {
          try {
            setLoading(true);
            const response = await axios.get("/api/paypal/create-subscription");
            const { planId } = response.data;
            
            if (!planId) {
              throw new Error("No plan ID received");
            }

            return actions.subscription.create({
              plan_id: planId
            });
          } catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
              toast.error(error.response.data.error);
            } else {
              toast.error("Something went wrong");
            }
            throw error;
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data) => {
          try {
            setLoading(true);
            await axios.post('/api/paypal/capture-subscription', {
              subscriptionId: data.subscriptionID
            });
            
            toast.success("Successfully subscribed!");
            window.location.href = '/dashboard';
          } catch (error) {
            console.error("Error capturing subscription:", error);
            toast.error("Failed to activate subscription. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error("PayPal Buttons Error:", err);
          toast.error("An error occurred during the subscription process.");
          setLoading(false);
        }
      }).render('#paypal-button-container-yearly');
    };

    loadPayPalScript();
  }, [isPro]);

  if (isPro) {
    return (
      <Button disabled className="w-full">
        <Zap className="w-4 h-4 mr-2" />
        You are a Pro user
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl font-bold text-center mb-4">
        Upgrade to Pro
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Monthly Plan</h3>
          <p className="text-sm text-gray-500 mb-4">Perfect for regular users</p>
          <div id="paypal-button-container-monthly" className="w-full" />
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Yearly Plan</h3>
          <p className="text-sm text-gray-500 mb-4">Best value for power users</p>
          <div id="paypal-button-container-yearly" className="w-full" />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};