"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader } from "@/components/loader";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface SubscriptionDetails {
  id: string;
  status: string;
  plan_id: string;
  // Add other relevant fields
}

const ManageSubscriptionPage = () => {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get("/api/paypal/get-subscription");
        setSubscription(response.data.subscription);
      } catch (error) {
        console.error("Fetch Subscription Error:", error);
        toast.error("Failed to fetch subscription details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      const response = await axios.post("/api/paypal/cancel-subscription", {
        subscriptionId: subscription.id,
      });

      if (response.status === 200) {
        toast.success("Subscription canceled successfully.");
        setSubscription(null);
      } else {
        toast.error("Failed to cancel subscription.");
      }
    } catch (error) {
      console.error("Cancel Subscription Error:", error);
      toast.error("An error occurred while canceling your subscription.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader />
        <p className="mt-4">Loading your subscription details...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Heading title="No Active Subscription" description="You are not subscribed to any plan." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Heading title="Manage Subscription" description="View and manage your current subscription." />
      <div className="mt-8 p-4 border rounded-lg w-full max-w-md">
        <p><strong>Subscription ID:</strong> {subscription.id}</p>
        <p><strong>Status:</strong> {subscription.status}</p>
        <p><strong>Plan ID:</strong> {subscription.plan_id}</p>
        {/* Add more details as needed */}
        <Button variant="destructive" className="mt-4" onClick={handleCancel}>
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
};

export default ManageSubscriptionPage;