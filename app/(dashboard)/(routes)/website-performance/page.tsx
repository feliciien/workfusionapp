/** @format */

import { Heading } from "@/components/heading";
import { WebsitePerformance } from "@/components/website/website-performance";
import { Settings } from "lucide-react";

export default function WebsitePerformancePage() {
  return (
    <div>
      <Heading
        title='Website Performance Analyzer'
        description="Analyze and optimize your website's performance, SEO, and accessibility."
        icon={Settings}
        iconColor='text-gray-700'
        bgColor='bg-gray-700/10'
      />
      <WebsitePerformance />
    </div>
  );
}
