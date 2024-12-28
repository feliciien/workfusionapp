import { Metadata } from "next";
import { UpdateCard } from "@/components/update-card";

export const metadata: Metadata = {
  title: "Updates | WorkFusion",
  description: "Stay up to date with the latest features and improvements in WorkFusion.",
};

const updates = [
  {
    title: "PayPal Integration & Subscription Management",
    description: "Seamlessly manage your WorkFusion subscription with PayPal integration",
    date: "December 2023",
    type: "NEW" as const,
    features: [
      "Secure PayPal subscription integration",
      "Automatic subscription renewal",
      "Subscription status tracking",
      "Enhanced error handling and user feedback"
    ]
  },
  {
    title: "Enhanced AI Conversation Capabilities",
    description: "Major improvements to our AI conversation system",
    date: "December 2023",
    type: "IMPROVEMENT" as const,
    features: [
      "Improved response accuracy and relevance",
      "Better context handling in conversations",
      "Faster response times",
      "Enhanced error recovery"
    ]
  },
  {
    title: "User Interface Enhancements",
    description: "Various improvements to the user interface and experience",
    date: "November 2023",
    type: "IMPROVEMENT" as const,
    features: [
      "Redesigned dashboard interface",
      "New dark mode improvements",
      "Better mobile responsiveness",
      "Improved loading states and animations"
    ]
  },
  {
    title: "Bug Fixes and Performance Optimization",
    description: "Various bug fixes and performance improvements",
    date: "November 2023",
    type: "FIX" as const,
    features: [
      "Fixed API rate limiting issues",
      "Improved error handling",
      "Better loading state management",
      "Enhanced API response caching"
    ]
  }
];

export default function UpdatesPage() {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Latest Updates</h1>
        <p className="text-muted-foreground">
          Stay up to date with the latest features, improvements, and fixes in WorkFusion.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {updates.map((update, index) => (
          <UpdateCard
            key={index}
            title={update.title}
            description={update.description}
            date={update.date}
            type={update.type}
            features={update.features}
          />
        ))}
      </div>
    </div>
  );
}
