// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { ModalProvider } from "@/components/modal-provider";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/ErrorBoundary"; 
import { OrganizationStructuredData } from "@/components/structured-data";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkFusion App - Advanced AI Platform for Business Automation",
  description: "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    apple: "/icon.png",
  },
  openGraph: {
    title: "WorkFusion App - Advanced AI Platform for Business Automation",
    description: "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity.",
    type: "website",
    locale: "en_US",
    siteName: "WorkFusion App",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WorkFusion App Preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkFusion App - Advanced AI Platform",
    description: "Transform your business with WorkFusion App's powerful AI tools.",
    images: ["/twitter-image.jpg"],
    creator: "@workfusion"
  },
  alternates: {
    canonical: "https://workfusionapp.com"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <OrganizationStructuredData />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "WorkFusion App",
                "applicationCategory": "BusinessApplication",
                "description": "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
          <link rel="icon" href="/favicon.ico" />
          <link 
            rel="apple-touch-icon" 
            sizes="180x180" 
            href="/apple-touch-icon.png"
          />
          <meta name="theme-color" content="#ffffff" />
        </head>
        <body 
          className={`${inter.className} overflow-x-hidden overscroll-none`} 
          suppressHydrationWarning
        >
          <ErrorBoundary>
            <ModalProvider />
            <ToasterProvider />
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}