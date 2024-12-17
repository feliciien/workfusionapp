import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - SynthAI",
  description: "Comprehensive documentation for SynthAI platform. Learn about our AI models, features, API integration, and best practices.",
  keywords: [
    "SynthAI documentation",
    "AI platform docs",
    "API reference",
    "code generation",
    "content creation",
    "image generation",
    "voice synthesis",
    "AI models"
  ],
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}
