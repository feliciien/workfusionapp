// Import statements
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { OrganizationStructuredData } from "@/components/structured-data";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script"; // Import Script for Google Analytics

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkFusion App - Advanced AI Platform for Business Automation",
  description:
    "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
  keywords: [
    "AI automation",
    "business automation",
    "WorkFusion",
    "productivity tools",
    "AI platform",
    "task automation",
    "content generation",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003"
  ),
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "WorkFusion App - Advanced AI Platform for Business Automation",
    description:
      "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity.",
    type: "website",
    locale: "en_US",
    siteName: "WorkFusion App",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WorkFusion App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkFusion App - Advanced AI Platform",
    description:
      "Transform your business with WorkFusion App's powerful AI tools.",
    images: ["/twitter-image.jpg"],
    creator: "@workfusion",
  },
  alternates: {
    canonical: "https://workfusionapp.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <OrganizationStructuredData />
        <meta name="theme-color" content="#ffffff" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "WorkFusion App",
              applicationCategory: "BusinessApplication",
              description:
                "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} h-full overflow-x-hidden overscroll-none`}
        suppressHydrationWarning
      >
        <Providers>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-6RZH54WYJJ"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
      
              gtag('config', 'G-6RZH54WYJJ');
            `}
          </Script>

          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
