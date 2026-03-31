const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { getAllRoutes } = require('./place-data.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_ROUTE_FILES = {
  '/': ['pages/Home.tsx', 'components/Footer.tsx'],
  '/hotspots': ['pages/AllHotspots.tsx', 'data/hotspots.ts'],
  '/diensten': ['pages/AllServices.tsx', 'data/services.ts'],
  '/losloopzones': ['pages/AllOffLeashAreas.tsx', 'data/offLeashAreas.ts', 'cityData.ts'],
  '/kaart': ['pages/CoastalMap.tsx', 'cityData.ts'],
  '/over-ons': ['pages/About.tsx'],
  '/goed-om-te-weten': ['pages/GoedOmTeWeten.tsx'],
  '/steun-ons': ['pages/Support.tsx'],
  '/privacy': ['pages/Privacy.tsx'],
  '/algemene-voorwaarden': ['pages/Terms.tsx'],
  '/cookies': ['pages/Cookies.tsx'],
  '/blog': ['pages/Blog.tsx', 'data/blogs.ts'],
  '/agenda': ['pages/Agenda.tsx', 'data/events.ts'],
  '/community': ['pages/Community.tsx'],
  '/updates': ['pages/Updates.tsx', 'components/Footer.tsx'],
};

const lastmodCache = new Map();

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
  if (route === '/updates') return 'weekly';
  if (route === '/agenda' || route === '/blog') return 'weekly';
  if (route.includes('/hotspots/') || route.includes('/diensten/')) return 'weekly';
  if (/^\/[^/]+$/.test(route) && route !== '/blog') return 'weekly';
  return 'monthly';
};

const getRouteFiles = (route) => {
  if (STATIC_ROUTE_FILES[route]) {
    return STATIC_ROUTE_FILES[route];
  }

  if (route.startsWith('/hotspots/') || route.startsWith('/diensten/')) {
    return [];
  }

  if (/^\/blog\/[^/]+$/.test(route)) {
    return ['pages/BlogDetail.tsx', 'data/blogs.ts'];
  }

  if (/^\/[^/]+\/hotspots\/[^/]+$/.test(route)) {
    return ['pages/PlaceDetail.tsx', 'data/hotspots.ts', 'utils/seo.ts', 'utils/placeRoutes.ts'];
  }

  if (/^\/[^/]+\/diensten\/[^/]+$/.test(route)) {
    return ['pages/PlaceDetail.tsx', 'data/services.ts', 'utils/seo.ts', 'utils/placeRoutes.ts'];
  }

  if (/^\/[^/]+$/.test(route)) {
    return ['pages/CityPage.tsx', 'cityData.ts', 'data/hotspots.ts', 'data/services.ts'];
  }

  return [];
};

const getLastmodForRoute = (route) => {
  const files = getRouteFiles(route);
  const cacheKey = files.join('|') || route;

  if (lastmodCache.has(cacheKey)) {
    return lastmodCache.get(cacheKey);
  }

  if (files.length === 0) {
    lastmodCache.set(cacheKey, TODAY);
    return TODAY;
  }

  try {
    const command = `git log -1 --format=%cs -- ${files.map((file) => `"${file}"`).join(' ')}`;
    const lastmod = execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || TODAY;
    lastmodCache.set(cacheKey, lastmod);
    return lastmod;
  } catch {
    lastmodCache.set(cacheKey, TODAY);
    return TODAY;
  }
};

const uniqueRoutes = [...new Set(getAllRoutes())];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map(
    (route) => `  <url>
    <loc>https://hondaanzee.be${route}</loc>
    <lastmod>${getLastmodForRoute(route)}</lastmod>
    <changefreq>${changefreqForRoute(route)}</changefreq>
    <priority>${priorityForRoute(route)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT_PATH, xml);
console.log(`Generated sitemap with ${uniqueRoutes.length} routes.`);
