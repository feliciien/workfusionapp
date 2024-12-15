import { Metadata } from "next";
import DashboardClient from "./page-client";

export const metadata: Metadata = {
  title: "AI Tools Dashboard - WorkFusion App",
  description: "Access a comprehensive suite of AI-powered tools for content creation, code generation, and more.",
  keywords: ["AI tools", "content creation", "code generation", "image generation", "video creation", "music synthesis"],
  openGraph: {
    title: "AI Tools Dashboard - WorkFusion App",
    description: "Access a comprehensive suite of AI-powered tools for content creation, code generation, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Dashboard - WorkFusion App",
    description: "Access a comprehensive suite of AI-powered tools for content creation, code generation, and more.",
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
