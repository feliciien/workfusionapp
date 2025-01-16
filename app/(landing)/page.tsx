import { Metadata } from "next";
import LandingContent from "@/components/landing-content";
import { LandingHero } from "@/components/landing-hero";
import { LandingNavbar } from "@/components/landing-navbar";
import { Analytics } from "@vercel/analytics/react";
import {
  PageSEO,
  generateMetadata as baseGenerateMetadata,
} from "@/components/seo/page-seo";
import Footer from "@/components/footer"; // Added Footer import

export const metadata: Metadata = baseGenerateMetadata({
  title: "Advanced AI Platform for Business Automation",
  description:
    "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
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
    "digital transformation",
  ],
});

function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header>
        <LandingNavbar />
      </header>

      <section aria-label="Hero Section" className="flex-grow">
        <LandingHero />
      </section>

      <section aria-label="Features and Benefits" className="py-16">
        <LandingContent />
      </section>

      <Footer /> {/* Added Footer component */}

      <Analytics />
    </main>
  );
}

export default LandingPage;
