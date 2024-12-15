"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { tools } from "./config";

interface Tool {
  label: string;
  description: string;
  icon: any;
  href: string;
  category: string;
  bgColor: string;
  color: string;
}

export default function DashboardClient() {
  const router = useRouter();

  return (
    <main className="flex-1 p-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl md:text-4xl font-bold text-center">
          Explore AI Tools
        </h1>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Experience the power of AI with our comprehensive suite of tools
        </p>
      </div>

      <nav aria-label="AI Tools Navigation">
        <div className="px-4 md:px-20 lg:px-32 space-y-4">
          {Object.entries(
            tools.reduce((acc, tool) => {
              if (!acc[tool.category]) {
                acc[tool.category] = [];
              }
              acc[tool.category].push(tool);
              return acc;
            }, {} as Record<string, Tool[]>)
          ).map(([category, categoryTools]) => (
            <section key={category} aria-label={`${category} Tools`}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map((tool) => (
                  <Card
                    key={tool.href}
                    onClick={() => router.push(tool.href)}
                    className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
                    role="link"
                    tabIndex={0}
                    aria-label={`${tool.label} - ${tool.description}`}
                  >
                    <div className="flex items-center gap-x-4">
                      <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                        <tool.icon className={cn("w-8 h-8", tool.color)} />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold">{tool.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <Analytics />
    </main>
  );
}
