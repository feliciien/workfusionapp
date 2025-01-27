/** @format */

import { Organization, WebPage, WithContext } from "schema-dts";

export function OrganizationStructuredData() {
  const structuredData: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WorkFusion App",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    logo: `https://www.workfusionapp.com/logo.png`,
    description:
      "Transform your business with WorkFusion App's powerful AI tools. Automate tasks, generate content, and boost productivity with our cutting-edge AI platform.",
    sameAs: [
      "https://www.linkedin.com/company/workfusionapp",
      "https://www.youtube.com/@WorkfusionApp"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "",
      contactType: "customer service",
      email: "support@workfusionapp.com",
      availableLanguage: ["English"]
    }
  };

  return (
    <script
      type='application/ld+json'
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
  canonical?: string;
  author?: string;
}

export function PageStructuredData({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  canonical,
  author
}: PageStructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: canonical || siteUrl,
    publisher: {
      "@type": "Organization",
      name: "WorkFusion App",
      logo: {
        "@type": "ImageObject",
        url: `https://www.workfusionapp.com/logo.png`
      }
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image
      }
    }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(author && {
      author: {
        "@type": "Person",
        name: author
      }
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl
        },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: canonical || siteUrl
        }
      ]
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical || siteUrl
    }
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
