const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { HOTSPOTS, SERVICES, getPlaceRoutes } = require('./place-data.cjs');
const { escapeHtml } = require('./static-html.cjs');

const root = path.resolve(__dirname, '..');
const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap.xml'), 'utf8');
const titles = new Set();
const descriptions = new Set();
const shareSource = fs.readFileSync(path.join(root, 'og-routes.js'), 'utf8');
const shareRoutes = JSON.parse(shareSource.slice(shareSource.indexOf('export default ') + 15).trim().replace(/;$/, ''));
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(config.buildCommand, 'npm run build', 'Vercel must use the verified static page build');
const socialRewrite = config.rewrites.findIndex((rewrite) => rewrite.destination.startsWith('/api/og-proxy'));
for (const source of ['/:city/hotspots/:slug', '/:city/diensten/:slug', '/hotspots', '/diensten']) {
  const index = config.rewrites.findIndex((rewrite) => rewrite.source === source);
  assert(index >= 0 && index < socialRewrite, `Business HTML must precede the social proxy: ${source}`);
}
for (const [collection, places] of [['hotspots', HOTSPOTS], ['diensten', SERVICES]]) {
  const directory = fs.readFileSync(path.join(root, 'dist', collection, 'index.html'), 'utf8');
  for (const place of places) {
    const route = `/${place.city}/${collection}/${place.slug}`;
    const html = fs.readFileSync(path.join(root, 'dist', route, 'index.html'), 'utf8').replace(/&#x27;/g, '&#39;');
    const canonical = `https://hondaanzee.be${route}`;
    assert(html.includes(`<link rel="canonical" href="${canonical}">`), `Wrong canonical: ${route}`);
    assert(html.includes(`<meta property="og:url" content="${canonical}">`), `Wrong OG URL: ${route}`);
    assert(html.includes(`<meta name="robots" content="index, follow`), `Not indexable: ${route}`);
    assert.equal((html.match(/<title>/g) || []).length, 1, `Duplicate title: ${route}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `Missing/duplicate heading: ${route}`);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert(title?.includes(escapeHtml(place.name)), `Business missing from title: ${route}`);
    assert(title?.startsWith(escapeHtml(place.name)), `Title must start with the business name: ${route}`);
    assert(description, `Missing description: ${route}`);
    assert.equal(escapeHtml(shareRoutes[route]?.title), title, `Wrong share metadata: ${route}`);
    assert(!titles.has(title), `Duplicate title: ${route}`);
    assert(!descriptions.has(description), `Duplicate description: ${route}`);
    titles.add(title);
    descriptions.add(description);
    assert(html.includes(escapeHtml(place.address)), `Missing address content: ${route}`);
    for (const paragraph of place.description.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean)) {
      assert(html.includes(escapeHtml(paragraph)), `Missing full business description: ${route}`);
    }
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json" data-dynamic="true">([\s\S]*?)<\/script>/)?.[1] || 'null');
    assert(schema?.some((entry) => entry.name === place.name && entry.url === canonical && entry['@id'] === `${canonical}#business`), `Missing business schema: ${route}`);
    assert(schema.some((entry) => entry['@type'] === 'BreadcrumbList'), `Missing breadcrumbs: ${route}`);
    const business = schema.find((entry) => entry['@id'] === `${canonical}#business`);
    const page = schema.find((entry) => entry['@type'] === 'WebPage');
    assert.equal(page?.mainEntity?.['@id'], business['@id'], `Wrong business-page connection: ${route}`);
    assert(business.address.postalCode?.match(/^\d{4}$/), `Missing real postal code: ${route}`);
    assert(page.dateModified, `Missing page revision date: ${route}`);
    assert(sitemap.includes(`<loc>${canonical}</loc>\n    <lastmod>${page.dateModified}</lastmod>`), `Sitemap and page dates differ: ${route}`);
    assert(directory.includes(`href="${route}"`), `Orphan business: ${route}`);
    assert(sitemap.includes(`<loc>${canonical}</loc>`), `Missing from sitemap: ${route}`);
  }
}
console.log(`Verified ${getPlaceRoutes().length} unique business pages: full HTML, SEO, schema, sitemap and directory links.`);
