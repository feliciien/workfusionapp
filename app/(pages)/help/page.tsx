import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | SynthAI",
  description: "Get help and support for SynthAI platform",
};

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Help Center</h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-xl text-muted-foreground">
          Our help center is currently under construction. Please check back soon for updates.
        </p>
        <p className="mt-4">
          In the meantime, if you need assistance, please contact our support team at{" "}
          <a href="mailto:support@workfusionapp.com" className="text-primary hover:text-primary/80">
            support@workfusionapp.com
          </a>
        </p>
      </div>
    </div>
  );
}
