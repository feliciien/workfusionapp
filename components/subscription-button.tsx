"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

declare global {
  interface Window {
    paypal?: {
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

const MONTHLY_BUTTON_ID = 'paypal-monthly';
const YEARLY_BUTTON_ID = 'paypal-yearly';

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ isPro = false }) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonsRendered, setButtonsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanupPayPalScript = () => {
    const script = document.querySelector('script[src*="paypal"]');
    if (script) {
      script.remove();
    }
    if (window.paypal) {
      window.paypal = undefined;
    }
  };

  const renderPayPalButtons = async () => {
    if (!window.paypal) {
      console.error("PayPal SDK not loaded");
      return;
    }

    try {
      // Monthly Plan Button
      const monthlyButton = window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async (data, actions) => {
          try {
            setLoading(true);
            const response = await axios.get("/api/paypal/create-subscription?plan=monthly");
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
      });

      // Yearly Plan Button
      const yearlyButton = window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async (data, actions) => {
          try {
            setLoading(true);
            const response = await axios.get("/api/paypal/create-subscription?plan=yearly");
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
      });

      // Wait for containers to be ready
      const waitForContainers = async () => {
        return new Promise<void>((resolve) => {
          const checkContainers = () => {
            const monthlyContainer = document.getElementById(MONTHLY_BUTTON_ID);
            const yearlyContainer = document.getElementById(YEARLY_BUTTON_ID);

            if (monthlyContainer && yearlyContainer) {
              monthlyContainer.innerHTML = '';
              yearlyContainer.innerHTML = '';
              resolve();
            } else {
              requestAnimationFrame(checkContainers);
            }
          };

          checkContainers();
        });
      };

      // Wait for containers and render buttons
      await waitForContainers();
      await monthlyButton.render(`#${MONTHLY_BUTTON_ID}`);
      await yearlyButton.render(`#${YEARLY_BUTTON_ID}`);
      
      setButtonsRendered(true);
    } catch (error) {
      console.error("Error rendering PayPal buttons:", error);
      toast.error("Failed to render PayPal buttons. Please refresh the page.");
    }
  };

  useEffect(() => {
    if (isPro) return;

    const loadPayPalScript = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get PayPal configuration
        const response = await axios.get('/api/paypal/token');
        const { clientId } = response.data;

        if (!clientId) {
          throw new Error("PayPal client ID not available");
        }

        // Remove any existing PayPal script
        cleanupPayPalScript();

        // Load new PayPal script
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
          script.async = true;
          
          script.onload = () => {
            setScriptLoaded(true);
            resolve();
          };
          
          script.onerror = () => {
            reject(new Error("Failed to load PayPal SDK"));
          };

          document.body.appendChild(script);
        });

        // Render buttons after script loads
        await renderPayPalButtons();
      } catch (error) {
        console.error("Error loading PayPal:", error);
        setError(error instanceof Error ? error.message : "Failed to initialize PayPal");
        toast.error("Failed to initialize PayPal. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPayPalScript();

    // Cleanup function
    return () => {
      cleanupPayPalScript();
    };
  }, [isPro]);

  if (isPro) {
    return (
      <Button disabled={true} variant="premium" className="w-full">
        <Zap className="w-4 h-4 ml-2 fill-white" />
        You are a Pro user
      </Button>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (loading && !scriptLoaded) {
    return (
      <div className="text-center">
        <p className="mb-4">Loading payment options...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold">Monthly Plan</h3>
        <p className="text-muted-foreground mt-1">$10/month - Unlimited access</p>
        <div id={MONTHLY_BUTTON_ID} className="w-full mt-4" />
      </div>
      <div>
        <h3 className="text-2xl font-bold">Yearly Plan</h3>
        <p className="text-muted-foreground mt-1">$100/year - Save 17%</p>
        <div id={YEARLY_BUTTON_ID} className="w-full mt-4" />
      </div>
    </div>
  );
};