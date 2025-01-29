import { FileText, Shield, Scale } from "lucide-react";

export const tools = [
  {
    label: "Contract Generator",
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    href: "/contract-generator",
    bgColor: "bg-blue-500/10",
    description: "Generate legally compliant contracts and agreements"
  },
  {
    label: "GDPR Compliance",
    icon: <Shield className="w-8 h-8 text-green-500" />,
    href: "/gdpr-compliance",
    bgColor: "bg-green-500/10",
    description: "Check and ensure GDPR compliance for your business"
  },
  {
    label: "Legal Research",
    icon: <Scale className="w-8 h-8 text-purple-500" />,
    href: "/legal-research",
    bgColor: "bg-purple-500/10",
    description: "AI-powered legal research and case analysis"
  }
];