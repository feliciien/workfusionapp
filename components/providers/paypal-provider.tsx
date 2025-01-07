"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalProviderProps {
  children: React.ReactNode;
}

const paypalConfig = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  components: "buttons",
  intent: "subscription",
  vault: true,
  currency: "USD"
};

export const PayPalProvider = ({
  children
}: PayPalProviderProps) => {
  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    console.error("PayPal client ID not configured. Please check your .env file.");
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider options={paypalConfig}>
      {children}
    </PayPalScriptProvider>
  );
};
