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
  keywords: "AI platform, business automation, artificial intelligence, productivity tools, machine learning, content generation, workflow automation, AI solutions, enterprise AI, digital transformation",
  authors: [{ name: "WorkFusion" }],
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
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
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