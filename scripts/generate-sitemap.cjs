const fs = require('node:fs');
const path = require('node:path');
const { getAllRoutes } = require('./place-data.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const LASTMOD = new Date().toISOString().slice(0, 10);

const priorityForRoute = (route) => {
  if (route === '/') return '1.0';
  if (route.startsWith('/blog/')) return '0.8';
  if (route.includes('/hotspots/') || route.includes('/diensten/')) return '0.8';
  if (route === '/hotspots' || route === '/losloopzones') return '0.9';
  if (route === '/diensten') return '0.8';
  if (/^\/[^/]+$/.test(route) && route !== '/blog') return '0.9';
  return '0.7';
};

const changefreqForRoute = (route) => {
  if (route === '/') return 'daily';
  if (route.includes('/hotspots/') || route.includes('/diensten/')) return 'weekly';
  if (/^\/[^/]+$/.test(route) && route !== '/blog') return 'weekly';
  return 'monthly';
};

const uniqueRoutes = [...new Set(getAllRoutes())];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map(
    (route) => `  <url>
    <loc>https://hondaanzee.be${route}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${changefreqForRoute(route)}</changefreq>
    <priority>${priorityForRoute(route)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT_PATH, xml);
console.log(`Generated sitemap with ${uniqueRoutes.length} routes.`);
