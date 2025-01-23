"use client";

import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "./modal-provider";
import { ToasterProvider } from "./toaster-provider";
import { AgentProvider } from "./ai/agent-provider";
import { WebsiteAgent } from "./ai/website-agent";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AgentProvider>
        <ModalProvider />
        <ToasterProvider />
        {children}
        <WebsiteAgent />
      </AgentProvider>
    </SessionProvider>
  );
}
