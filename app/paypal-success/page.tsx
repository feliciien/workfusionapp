"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/loader";
import { Heading } from "@/components/heading";
import { CheckCircle } from "lucide-react";

const PayPalSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSubscription = async () => {
      const subscriptionId = searchParams.get("subscription_id");

      if (!subscriptionId) {
        toast.error("Subscription ID not found.");
        router.push("/dashboard");
        return;
      }

      try {
        const response = await axios.post("/api/paypal/capture-subscription", {
          subscriptionId,
        });

        if (response.status === 200) {
          toast.success("Subscription activated successfully!");
          router.push("/dashboard");
        } else {
          toast.error("Failed to activate subscription.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Subscription Capture Error:", error);
        toast.error("An error occurred while activating your subscription.");
        router.push("/dashboard");
      }
    };

    handleSubscription();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <CheckCircle className="w-16 h-16 text-green-500" />
      <Heading title="Subscription Activated!" description="Thank you for subscribing to SynthAI." />
      <Loader />
    </div>
  );
};

export default PayPalSuccessPage;