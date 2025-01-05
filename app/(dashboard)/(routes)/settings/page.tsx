import { Heading } from "@/components/heading";
import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";
import { Settings, Sparkles, Check, Zap, Crown, Star, Clock, Shield, BadgePercent } from "lucide-react";
import { Analytics } from '@vercel/analytics/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tools } from "../dashboard/config";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SettingsPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const isPro = await checkSubscription(userId);
  const proTools = tools.filter(tool => tool.proOnly);
  const limitedTools = tools.filter(tool => tool.limitedFree);

  const features = [
    {
      icon: Zap,
      title: "Unlimited Access",
      description: "Use all AI tools without any restrictions",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Crown,
      title: "Premium Features",
      description: "Access to exclusive pro-only features",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Star,
      title: "Priority Processing",
      description: "Faster response times for all AI operations",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Clock,
      title: "Early Access",
      description: "Be first to try new features and updates",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "24/7 premium customer support",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  return (
    <div>
      <Heading 
        title="Upgrade to Pro" 
        description="Choose the perfect plan for your needs" 
        icon={Sparkles} 
        iconColor="text-violet-500" 
        bgColor="bg-violet-500/10" 
      />
      <div className="px-4 lg:px-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Plan */}
          <Card className="p-6 border-2 border-violet-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-violet-500 to-indigo-500 text-white px-4 py-2 rounded-bl-lg text-sm font-medium">
              14-DAY FREE TRIAL
            </div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Monthly Pro
              <Sparkles className="h-6 w-6 text-violet-500" />
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold">$10</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <BadgePercent className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-500">14-day free trial included</p>
            </div>
            <div className="space-y-4 mb-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", feature.bgColor)}>
                    <feature.icon className={cn("h-4 w-4", feature.color)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <SubscriptionButton 
                isPro={isPro} 
                planId={process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID!}
              />
              <SubscriptionButton 
                isPro={isPro} 
                planId={process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID!}
                variant="outline"
              >
                Switch to Yearly (Save 17%)
              </SubscriptionButton>
            </div>
          </Card>

          {/* Yearly Plan */}
          <Card className="p-6 border-2 border-violet-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-violet-500 to-indigo-500 text-white px-4 py-2 rounded-bl-lg text-sm font-medium">
              BEST VALUE
            </div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Yearly Pro
              <Crown className="h-6 w-6 text-yellow-500" />
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold">$100</span>
              <span className="text-muted-foreground">/year</span>
              <div className="mt-1">
                <span className="text-sm text-green-500">Save $20 (17% off)</span>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", feature.bgColor)}>
                    <feature.icon className={cn("h-4 w-4", feature.color)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <SubscriptionButton 
              isPro={isPro} 
              planId={process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID!}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-violet-500/20">
            <h3 className="text-xl font-bold mb-4">Pro-Only Tools</h3>
            <div className="grid gap-4">
              {proTools.map((tool) => (
                <div key={tool.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-violet-500/5 transition">
                  <div className={cn("p-2 rounded-lg", tool.bgColor)}>
                    <tool.icon className={cn("h-4 w-4", tool.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{tool.label}</h4>
                      <Badge variant="premium" className="text-[10px]">PRO</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-violet-500/20">
            <h3 className="text-xl font-bold mb-4">Unlimited Usage</h3>
            <div className="grid gap-4">
              {limitedTools.map((tool) => (
                <div key={tool.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-violet-500/5 transition">
                  <div className={cn("p-2 rounded-lg", tool.bgColor)}>
                    <tool.icon className={cn("h-4 w-4", tool.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{tool.label}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {tool.freeLimit} free / Unlimited with Pro
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default SettingsPage;
