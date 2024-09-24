// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CrispProvider from "@/components/crisp-provider";
import { ModalProvider } from "@/components/modal-provider";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/ErrorBoundary"; // Import ErrorBoundary
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "workfusionapp ",
  description: "An AI platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>workfusionapp</title>
          <meta name="description" content="An AI platform." />
        </head>
        <body className={inter.className}>
          <ModalProvider />
          <ToasterProvider />
          <CrispProvider />
          <ErrorBoundary>
            <main>{children}</main>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}