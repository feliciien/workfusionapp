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
  title: "WorkFusion App - Advanced AI Platform for Business Automation",
  description: "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
  keywords: "AI platform, business automation, artificial intelligence, productivity tools, machine learning, content generation",
  authors: [{ name: "WorkFusion" }],
  openGraph: {
    title: "WorkFusion App - Advanced AI Platform for Business Automation",
    description: "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity.",
    type: "website",
    locale: "en_US",
    siteName: "WorkFusion App",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkFusion App - Advanced AI Platform",
    description: "Transform your business with WorkFusion App's powerful AI tools.",
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="keywords" content="AI platform, business automation, artificial intelligence, productivity tools, machine learning, content generation" />
          <meta name="author" content="WorkFusion" />
          <link rel="canonical" href="https://workfusionapp.com" />
          <meta name="robots" content="index, follow" />
          <title>WorkFusion App - Advanced AI Platform for Business Automation</title>
          <meta name="description" content="Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform." />
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