/** @format */

import { PageStructuredData } from "@/components/structured-data";
import { Metadata } from "next";

interface PageSEOProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  canonical?: string;
  author?: string;
  language?: string;
}

export function PageSEO({
  title,
  description,
  image,
  keywords = [],
  publishedTime,
  modifiedTime,
  noindex = false,
  canonical,
  author,
  language = "en"
}: PageSEOProps) {
  const fullTitle = `${title} | WorkFusion App`;
  const defaultImage = "/og-image.jpg";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <>
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords.join(", ")} />
      {noindex && <meta name='robots' content='noindex,nofollow' />}
      <meta name='language' content={language} />
      {author && <meta name='author' content={author} />}
      {canonical && <link rel='canonical' href={canonical} />}
      <meta name='viewport' content='width=device-width, initial-scale=1' />

      {/* Open Graph */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image || defaultImage} />
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='WorkFusion App' />
      <meta property='og:url' content={canonical || siteUrl} />
      {publishedTime && (
        <meta property='article:published_time' content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property='article:modified_time' content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image || defaultImage} />
      <meta name='twitter:site' content='@workfusion' />

      {/* Schema.org structured data */}
      <PageStructuredData
        title={fullTitle}
        description={description}
        image={image || defaultImage}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        canonical={canonical}
        author={author}
      />
    </>
  );
}

export function generateMetadata({
  title,
  description,
  image,
  keywords = [],
  noindex = false,
  canonical,
  language = "en"
}: PageSEOProps): Metadata {
  const fullTitle = `${title} | WorkFusion App`;
  const defaultImage = "/og-image.jpg";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: fullTitle,
    description,
    keywords: keywords,
    openGraph: {
      title: fullTitle,
      description,
      images: [{ url: image || defaultImage }],
      siteName: "WorkFusion App",
      url: canonical || siteUrl,
      locale: language,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image || defaultImage],
      site: "@workfusion"
    },
    robots: {
      index: !noindex,
      follow: !noindex
    },
    alternates: {
      canonical: canonical || siteUrl
    }
  };
}
