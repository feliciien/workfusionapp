"use client";

import { useEffect } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";

interface SubscriptionButtonProps {
  isPro: boolean;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ isPro = false }) => {
  useEffect(() => {
    if (isPro) return; // Don't render buttons if the user is already Pro

    // Function to render PayPal buttons
    const renderPayPalButtons = () => {
      // Monthly Plan Button
      paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            /* Creates the subscription */
            plan_id: 'P-8Y551355TK076831TM5M7OZA' // Replace with your actual Monthly Plan ID
          });
        },
        onApprove: function(data, actions) {
          // Capture the subscription ID and send it to your backend for processing
          const subscriptionID = data.subscriptionID;
          toast.success("Subscription created successfully!");

          // Redirect to a success page with the subscription ID
          window.location.href = `/paypal-success?subscription_id=${subscriptionID}`;
        },
        onError: function(err) {
          console.error("PayPal Buttons Error:", err);
          toast.error("An error occurred during the subscription process.");
        }
      }).render('#paypal-button-container-P-8Y551355TK076831TM5M7OZA');

      // Yearly Plan Button
      paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            /* Creates the subscription */
            plan_id: 'P-67X44179VA3351546M5M7P5I' // Replace with your actual Yearly Plan ID
          });
        },
        onApprove: function(data, actions) {
          // Capture the subscription ID and send it to your backend for processing
          const subscriptionID = data.subscriptionID;
          toast.success("Subscription created successfully!");

          // Redirect to a success page with the subscription ID
          window.location.href = `/paypal-success?subscription_id=${subscriptionID}`;
        },
        onError: function(err) {
          console.error("PayPal Buttons Error:", err);
          toast.error("An error occurred during the subscription process.");
        }
      }).render('#paypal-button-container-P-67X44179VA3351546M5M7P5I');
    };

    // Check if PayPal script is already loaded
    if (typeof paypal !== "undefined") {
      renderPayPalButtons();
    } else {
      // Dynamically load PayPal SDK
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=Ae90A0I_mjwxPFWOSyVCgLWplSk-Bi-zRdhePxNNbfs1qMn-JsiJoCE5R3KEukWF0QhKqqDiM-Duy_HG&vault=true&intent=subscription";
      script.async = true;
      script.onload = () => {
        renderPayPalButtons();
      };
      script.onerror = () => {
        toast.error("Failed to load PayPal SDK.");
      };
      document.body.appendChild(script);
    }
  }, [isPro]);

  if (isPro) {
    return (
      <Button variant="default" onClick={() => window.location.href = "/manage-subscription"}>
        Manage Subscription
      </Button>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Monthly Plan Button */}
      <div id="paypal-button-container-P-8Y551355TK076831TM5M7OZA"></div>

      {/* Yearly Plan Button */}
      <div id="paypal-button-container-P-67X44179VA3351546M5M7P5I"></div>
    </div>
  );
};