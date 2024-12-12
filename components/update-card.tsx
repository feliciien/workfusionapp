"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

interface UpdateCardProps {
  title: string;
  description: string;
  date: string;
  type: "NEW" | "IMPROVEMENT" | "FIX";
  features?: string[];
}

const typeColors = {
  NEW: "bg-green-500",
  IMPROVEMENT: "bg-blue-500",
  FIX: "bg-orange-500",
};

export const UpdateCard = ({
  title,
  description,
  date,
  type,
  features,
}: UpdateCardProps) => {
  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${typeColors[type]} text-white`}>
            {type}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-1" />
            {date}
          </div>
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      {features && features.length > 0 && (
        <CardContent>
          <ul className="list-disc list-inside space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
};
