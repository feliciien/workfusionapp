/** @format */

"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tools } from "./constants";

export default function LegalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className='mb-8 space-y-4'>
        <h2 className='text-2xl md:text-4xl font-bold text-center'>
          Legal AI Tools
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          Generate and analyze legal documents with AI assistance
        </p>
      </div>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className={cn(
              "p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
            )}>
            <div className='flex items-center gap-x-4'>
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                {tool.icon}
              </div>
              <div className='font-semibold'>{tool.label}</div>
            </div>
            <ArrowRight className='w-5 h-5' />
          </Card>
        ))}
      </div>
    </div>
  );
}
