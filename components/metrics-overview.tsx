"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, Zap, Clock, Crown } from "lucide-react";
import { useEffect, useState } from "react";

const MetricsOverview = ({ isPro }: { isPro: boolean }) => {
  const [apiLimitCount, setApiLimitCount] = useState(0);
  const MAX_FREE_COUNTS = 20; // Import or define the max free count

  useEffect(() => {
    const fetchApiLimit = async () => {
      try {
        const response = await fetch("/api/api-limit");
        if (!response.ok) {
          throw new Error("Failed to fetch API limit");
        }
        const data = await response.json();
        setApiLimitCount(data.count || 0);
      } catch (error) {
        console.error("Error fetching API limit:", error);
      }
    };

    fetchApiLimit();
  }, []);

  const metrics = [
    {
      label: "Tools Used",
      value: apiLimitCount.toString(),
      icon: BarChart3,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Remaining Quota",
      value: isPro
        ? "Unlimited"
        : `${Math.max(MAX_FREE_COUNTS - apiLimitCount, 0)} / ${MAX_FREE_COUNTS}`,
      icon: Clock,
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      label: "Account Status",
      value: isPro ? "Pro Member" : "Free Member",
      icon: isPro ? Crown : Zap,
      iconColor: isPro ? "text-yellow-500" : "text-purple-500",
      bgColor: isPro ? "bg-yellow-100" : "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-6 flex items-center">
          <div className={`mr-4 p-2 rounded-full ${metric.bgColor}`}>
            <metric.icon className={`w-8 h-8 ${metric.iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetricsOverview;
