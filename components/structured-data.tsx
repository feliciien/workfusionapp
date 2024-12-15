import { Organization, WithContext } from "schema-dts";

export function OrganizationStructuredData() {
  const structuredData: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WorkFusion App",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    description: "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
    sameAs: [
      "https://twitter.com/workfusion",
      // Add other social media profiles here
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "",
      contactType: "customer service",
      email: "support@workfusionapp.com",
      availableLanguage: ["English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface PageStructuredDataProps {
  title: string;
  description: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function PageStructuredData({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
}: PageStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    publisher: {
      "@type": "Organization",
      name: "WorkFusion App",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    },
    ...(image && { image }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
