import { Heading } from "@/components/heading";
import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";
import { Settings } from "lucide-react";
import { Analytics } from '@vercel/analytics/react';

const SettingsPage = async () => {
  // Force dynamic rendering
  const timestamp = Date.now();
  console.log("[SETTINGS_PAGE] Checking subscription:", { timestamp: new Date(timestamp).toISOString() });
  
  const isPro = await checkSubscription();
  
  console.log("[SETTINGS_PAGE] Subscription status:", { isPro, timestamp: new Date(timestamp).toISOString() });

  return (
    <div>
      <Heading title="Settings" description="Manage account settings." icon={Settings} iconColor="text-gray-700" bgColor="bg-gray-700/10" />
      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro ? "You are currently on a pro plan." : "You are currently on a free plan."}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
      <Analytics />
    </div>
  );
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default SettingsPage;
