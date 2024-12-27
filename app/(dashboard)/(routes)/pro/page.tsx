"use client";

import React from "react";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { tools } from "../dashboard/config";
import { Settings } from "lucide-react";
import { useProModal } from "@/hooks/use-pro-modal";
import { Badge } from "@/components/ui/badge";

const ProPage = () => {
  const proModal = useProModal();

  const features = [
    {
      label: "Unlimited AI Generations",
      icon: Settings,
    },
    {
      label: "Priority Support",
      icon: Settings,
    },
    {
      label: "Early Access to New Features",
      icon: Settings,
    }
  ];

  return (
    <div>
      <Heading
        title="Pro Features"
        description="Unlock the full potential of AI with Pro"
        icon={Settings}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Card key={tool.href} className="p-4 border-black/5 flex flex-col justify-between">
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn("w-6 h-6", tool.color)} />
                </div>
                <div className="font-semibold">{tool.label}</div>
                {tool.proOnly && (
                  <Badge variant="premium" className="uppercase text-sm py-1">
                    PRO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {tool.description}
              </p>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-between space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold">Upgrade to Pro Today!</h3>
              <p className="text-muted-foreground mt-2">
                Unlock all features and take your AI experience to the next level
              </p>
            </div>
            <Button onClick={proModal.onOpen} size="lg" variant="premium">
              Upgrade Now
            </Button>
          </div>
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4">What&apos;s included:</h4>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.label} className="p-4">
                  <div className="flex items-center gap-x-4">
                    <div className="p-2 w-fit rounded-md bg-violet-500/10">
                      <feature.icon className="w-6 h-6 text-violet-500" />
                    </div>
                    <div className="font-semibold">{feature.label}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProPage;
