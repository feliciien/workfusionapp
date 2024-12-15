import { Metadata } from "next";
import { PageStructuredData } from "@/components/structured-data";

interface PageSEOProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

export function PageSEO({
  title,
  description,
  image,
  keywords = [],
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageSEOProps) {
  const fullTitle = `${title} | WorkFusion App`;
  const defaultImage = "/og-image.jpg";

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:type" content="website" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Schema.org structured data */}
      <PageStructuredData
        title={fullTitle}
        description={description}
        image={image || defaultImage}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
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
}: PageSEOProps): Metadata {
  const fullTitle = `${title} | WorkFusion App`;
  const defaultImage = "/og-image.jpg";

  return {
    title: fullTitle,
    description,
    keywords: keywords,
    openGraph: {
      title: fullTitle,
      description,
      images: [{ url: image || defaultImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image || defaultImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
  };
}
