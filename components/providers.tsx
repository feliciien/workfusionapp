"use client";

import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "./modal-provider";
import { ToasterProvider } from "./toaster-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ModalProvider />
      <ToasterProvider />
      {children}
    </SessionProvider>
  );
}
