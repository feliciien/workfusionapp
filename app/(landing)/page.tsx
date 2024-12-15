import { Metadata } from "next";
import LandingContent from "@/components/landing-content";
import { LandingHero } from "@/components/landing-hero";
import { LandingNabvbar } from "@/components/landing-navbar";
import { Analytics } from '@vercel/analytics/react';
import { PageSEO, generateMetadata as baseGenerateMetadata } from "@/components/seo/page-seo";

export const metadata: Metadata = baseGenerateMetadata({
  title: "Advanced AI Platform for Business Automation",
  description: "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
  keywords: [
    "AI platform",
    "business automation",
    "artificial intelligence",
    "productivity tools",
    "machine learning",
    "content generation",
    "workflow automation",
    "AI solutions",
    "enterprise AI",
    "digital transformation"
  ],
});

function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header>
        <LandingNabvbar />
      </header>

      <section aria-label="Hero Section" className="flex-grow">
        <LandingHero />
      </section>

      <section 
        aria-label="Features and Benefits"
        className="py-16"
      >
        <LandingContent />
      </section>

      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">
            {new Date().getFullYear()} WorkFusion App. All rights reserved.
          </p>
        </div>
      </footer>

      <Analytics />
    </main>
  );
}

export default LandingPage;
