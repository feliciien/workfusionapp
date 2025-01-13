// app/layout.tsx
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { OrganizationStructuredData } from "@/components/structured-data";
import { Providers } from "@/components/providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkFusion App - Advanced AI Platform for Business Automation",
  description:
    "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003"),
  icons: {
    apple: "/apple-touch-icon.png",
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
    description: "Transform your business with WorkFusion App's powerful AI tools.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <OrganizationStructuredData />
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.className} h-full overflow-x-hidden overscroll-none`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
