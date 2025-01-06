"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { SubscriptionButton } from "@/components/subscription-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import axios from "axios";

const paypalConfig = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  components: "buttons",
  intent: "subscription",
  vault: true,
  currency: "USD"
};

const SettingsPage = () => {
  const [session, setSession] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      const session = await getSession();
      if (!session?.user) {
        redirect("/");
      }
      setSession(session);

      // Check subscription status
      try {
        const response = await axios.get("/api/subscription/check");
        setIsPro(response.data.isPro);
      } catch (error) {
        console.error("Failed to check subscription status:", error);
      }

      setLoading(false);
    };

    initializeSession();

    // Log PayPal configuration in development
    if (process.env.NODE_ENV === "development") {
      console.log("PayPal Config:", {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        monthlyPlanId: process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID,
        yearlyPlanId: process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID
      });
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    console.error("PayPal client ID is missing");
    return <div>PayPal configuration error. Please contact support.</div>;
  }

  return (
    <PayPalScriptProvider options={paypalConfig}>
      <div className="h-full p-4 space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and subscription
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
          </div>
        </div>

        {/* User Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="rounded-full h-12 w-12"
              />
            )}
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
            <Badge variant={isPro ? "premium" : "secondary"} className="ml-auto">
              {isPro ? "Pro Plan" : "Free Plan"}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <Card className={`flex flex-col ${!isPro ? "border-2 border-primary" : ""}`}>
            <CardHeader>
              <CardTitle>Monthly Plan</CardTitle>
              <CardDescription>Perfect for regular users</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-2">$10</div>
              <div className="text-sm text-muted-foreground mb-4">/month</div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">✓</Badge>
                  Unlimited AI generations
                </li>
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">✓</Badge>
                  Priority support
                </li>
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">✓</Badge>
                  Advanced features
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <SubscriptionButton 
                isPro={isPro}
                planType="monthly"
              />
            </CardFooter>
          </Card>

          {/* Yearly Plan */}
          <Card className={`flex flex-col ${isPro ? "border-2 border-primary" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Yearly Plan</CardTitle>
                <Badge variant="default">Save 17%</Badge>
              </div>
              <CardDescription>Best value for power users</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-2">$100</div>
              <div className="text-sm text-muted-foreground mb-4">/year</div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">✓</Badge>
                  Everything in Monthly
                </li>
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">✓</Badge>
                  2 months free
                </li>
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">✓</Badge>
                  Early access features
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <SubscriptionButton 
                isPro={isPro}
                planType="yearly"
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default SettingsPage;
