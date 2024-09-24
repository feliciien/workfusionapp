import LandingContent from "@/components/landing-content";
import { LandingHero } from "@/components/landing-hero";
import { LandingNabvbar } from "@/components/landing-navbar";
import { Analytics } from '@vercel/analytics/react';
function LandingPage() {
  return (
    <div className="h-full">
      <LandingNabvbar />
      <LandingHero />
      <LandingContent />
    </div>
  );
}

export default LandingPage;
