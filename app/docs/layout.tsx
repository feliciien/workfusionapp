import { Metadata } from "next";
import DocsMobileNavbar from "@/components/docs-mobile-navbar";

export const metadata: Metadata = {
  title: "Documentation - WorkFusion",
  description:
    "Comprehensive documentation for WorkFusion platform. Learn about our AI models, features, API integration, and best practices.",
  keywords: [
    "WorkFusion documentation",
    "AI platform docs",
    "API reference",
    "code generation",
    "content creation",
    "image generation",
    "voice synthesis",
    "AI models",
  ],
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <DocsMobileNavbar />
      {children}
    </div>
  );
}
