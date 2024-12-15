const fs = require('fs');
const globby = require('globby');
const prettier = require('prettier');

async function generate(): Promise<void> {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc');
  const pages: string[] = await globby([
    'app/**/*.tsx',
    'app/**/*.ts',
    '!app/api/**/*',
    '!app/**/_*.*', // Exclude Next.js special files
    '!app/**/layout.*', // Exclude layout files
    '!app/**/loading.*', // Exclude loading files
    '!app/**/error.*', // Exclude error files
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${pages
        .map((page: string) => {
          // Convert file path to URL path
          const path = page
            .replace('app', '')
            .replace(/\.tsx?$/, '')
            .replace(/\/page$/, '')
            .replace(/\(.*?\)/g, ''); // Remove route groups

          // Skip if path is empty (home page) or contains dynamic routes
          if (!path || path.includes('[')) return '';

          return `
            <url>
              <loc>${baseUrl}${path}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  const formatted = await prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  fs.writeFileSync('public/sitemap.xml', formatted);
  console.log('Sitemap generated successfully!');
}

generate();
