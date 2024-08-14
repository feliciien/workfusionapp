/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
	  domains: ["oaidalleapiprodscus.blob.core.windows.net"],
	},
	experimental: {
	  appDir: true, // Enable the new App directory (optional)
	},
	// Optionally configure the `font` feature if using Next.js 13.4 or later
	// You can use @next/font directly in your components/pages
  };
  
  module.exports = nextConfig;