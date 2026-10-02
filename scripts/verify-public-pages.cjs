const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { getAllRoutes } = require('./place-data.cjs');

function verifyPublicPages() {
  const root = path.resolve(__dirname, '../dist');
  const titles = new Map();
  const rewrites = require('../vercel.json').rewrites;
  assert(!rewrites.some(rule => rule.source === '/:path*' && rule.destination === '/index.html'), 'Homepage SPA fallback reintroduces incorrect canonicals and soft 404s');
  for (const route of new Set(getAllRoutes())) {
    const file = path.join(root, route === '/' ? '' : route, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    const canonical = `https://hondaanzee.be${route}`;
    assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, `Canonical count: ${route}`);
    assert(html.includes(`<link rel="canonical" href="${canonical}">`), `Wrong canonical: ${route}`);
    assert(html.includes('<main id="main-content"'), `Missing content: ${route}`);
    assert(/<h1\b/.test(html), `Missing page heading: ${route}`);
    assert(!/<meta name="robots" content="noindex/.test(html), `Public page noindexed: ${route}`);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert(title, `No title: ${route}`);
    assert(!titles.has(title), `Duplicate title: ${route} and ${titles.get(title)}`);
    titles.set(title, route);
    assert(html.match(/<meta name="description" content="([^"]+)"/)?.[1], `No description: ${route}`);
    if (route !== '/') {
      const rule = rewrites.find(rule => {
        const expression = rule.source.replace(/:[a-zA-Z]+/g, '[^/]+');
        return new RegExp(`^${expression}$`).test(route);
      });
      assert(rule && rule.destination.endsWith('/index.html'), `No static routing: ${route}`);
    }
  }
  assert(fs.readFileSync(path.join(root, '404.html'), 'utf8').includes('noindex, follow'), 'Missing custom noindex 404');
  assert(!fs.readFileSync(path.join(root, 'spa.html'), 'utf8').includes('rel="canonical"'), 'Runtime pages inherit homepage canonical');
  assert(fs.readFileSync(path.join(root, 'private.html'), 'utf8').includes('noindex, nofollow'), 'Admin shell must not be indexed');
  console.log(`Verified all ${titles.size} public pages: route-specific canonical, title and full initial HTML.`);
}
module.exports = { verifyPublicPages };
if (require.main === module) verifyPublicPages();
