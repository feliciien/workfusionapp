"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/loader";
import { Heading } from "@/components/heading";
import { CheckCircle, XCircle } from "lucide-react";

const PayPalSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleSubscription = async () => {
      if (!searchParams) {
        setStatus("error");
        setError("Search parameters not found");
        toast.error("Search parameters not found");
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }

      const subscriptionId = searchParams.get("subscription_id");

      if (!subscriptionId) {
        setStatus("error");
        setError("Subscription ID not found");
        toast.error("Subscription ID not found");
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }

      try {
        const response = await axios.post("/api/paypal/capture-subscription", {
          subscriptionId,
        });

        if (response.data.success) {
          setStatus("success");
          toast.success("Subscription activated successfully!");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          throw new Error(response.data.error || "Failed to activate subscription");
        }
      } catch (error) {
        console.error("Subscription Capture Error:", error);
        setStatus("error");
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          setError(error.response.data.error);
          toast.error(error.response.data.error);
        } else {
          setError("An error occurred while activating your subscription");
          toast.error("An error occurred while activating your subscription");
        }
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    };

    handleSubscription();
  }, [searchParams, router]);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      {status === "loading" && (
        <>
          <Loader />
          <Heading
            title="Activating Subscription..."
            description="Please wait while we activate your subscription."
          />
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500" />
          <Heading
            title="Subscription Activated!"
            description="Thank you for subscribing to WorkFusion."
          />
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-red-500" />
          <Heading
            title="Activation Failed"
            description={error || "An error occurred while activating your subscription"}
          />
        </>
      )}
    </div>
  );
};

export default PayPalSuccessPage;