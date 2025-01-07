"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalProviderProps {
  children: React.ReactNode;
}

export const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    console.error("PayPal client ID is not configured");
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        components: "buttons",
        intent: "subscription",
        vault: true,
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};
