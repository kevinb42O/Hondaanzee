const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const puppeteer = require('puppeteer');
const { getAllRoutes } = require('./place-data.cjs');
const root = path.resolve(__dirname, '../dist');
const routes = getAllRoutes();
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.avif': 'image/avif' };
const server = createServer((req, res) => {
  const route = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(root, route);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    if (/^\/admin(?:\/|$)/.test(route) || route === '/_meldpunt-admin') file = path.join(root, 'private.html');
    else if (/^\/meldpunt\/[^/]+$/.test(route)) file = path.join(root, 'spa.html');
    else { res.statusCode = 404; file = path.join(root, '404.html'); }
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setBypassServiceWorker(true);
    await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', req => req.url().startsWith(base) ? req.continue() : req.abort());
    await page.setViewport({ width: 1440, height: 1000 });
    const examples = ['/', '/koksijde', '/de-panne', '/blog', routes.find(r => r.startsWith('/blog/')),
      '/agenda', routes.find(r => r.startsWith('/agenda/')), '/agenda/fotoshoot-de-haan-2026', '/agenda/hondenwandeling-bredene-2027', '/agenda/zeeuwse-winterfair-2026', '/losloopzones', routes.find(r => r.startsWith('/losloopzones/')), '/kaart', '/cookies', '/steun-ons', '/zaak-aanmelden'];
    const titles = new Map();
    await page.setJavaScriptEnabled(false);
    for (const route of examples) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      assert.equal(await page.$eval('link[rel=canonical]', el => el.href), `https://hondaanzee.be${route}`);
      titles.set(route, await page.title());
      // CSS entrance animations still run when scripts are disabled. Wait for
      // their first visible frame before checking the static heading.
      // Puppeteer's scheduled predicates do not run with page JS disabled.
      await new Promise(resolve => setTimeout(resolve, 100));
      const content = await page.$eval('main', el => ({
        text: el.textContent.length,
        visibleHeading: [...el.querySelectorAll('h1')].some(heading => {
          if (!heading.getBoundingClientRect().height) return false;
          for (let node = heading; node; node = node.parentElement) {
            const style = getComputedStyle(node);
            if (Number(style.opacity) === 0 || style.visibility === 'hidden' || style.display === 'none') return false;
          }
          return true;
        }),
      }));
      if (!content.visibleHeading) console.log(route, await page.$$eval('main h1', elements => elements.map(heading => {
        const chain = []; for (let node = heading; node; node = node.parentElement) chain.push({ tag: node.tagName, class: node.className, opacity: getComputedStyle(node).opacity, display: getComputedStyle(node).display, height: node.getBoundingClientRect().height }); return chain;
      })));
      assert(content.text > 100 && content.visibleHeading, `Empty or invisible initial page: ${route}`);
    }
    for (const route of ['/community', '/bestaat-niet', '/blog/bestaat-niet', '/blankenberge/hotspots/bestaat-niet']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 404);
      assert.equal(await page.$eval('h1', el => el.textContent), '404');
      assert.match(await page.$eval('meta[name=robots]', el => el.content), /noindex/);
    }
    await page.goto(base + '/agenda');
    const agendaLinks = await page.$$eval('main a[href^="/agenda/"]', elements => elements.map(el => el.getAttribute('href')));
    for (const route of routes.filter(route => route.startsWith('/agenda/'))) assert(agendaLinks.includes(route), `No-JS agenda link: ${route}`);
    console.log('No JavaScript: visible complete home, towns, blogs, events, maps and policies; genuine 404s: OK.');
    await page.setJavaScriptEnabled(true);
    for (const route of examples) {
      await page.goto(base + route);
      await page.waitForFunction(() => document.querySelector('main') && !document.querySelector('#root[data-static-page]'));
      await page.waitForNetworkIdle({ idleTime: 100, timeout: 10000 }).catch(error => {
        error.message += ` (public route: ${route})`;
        throw error;
      });
      assert.equal(await page.title(), titles.get(route), `Initial and client title mismatch: ${route}`);
      assert.equal(await page.$eval('link[rel=canonical]', el => el.href), `https://hondaanzee.be${route}`);
    }
    await page.goto(base + '/agenda');
    await page.waitForFunction(() => !document.querySelector('#root[data-static-page]'));
    await page.waitForSelector('a[href="/agenda/fotoshoot-de-haan-2026"]');
    await page.click('a[href="/agenda/fotoshoot-de-haan-2026"]');
    await page.waitForFunction(() => document.querySelector('link[rel=canonical]')?.href.endsWith('/agenda/fotoshoot-de-haan-2026'));
    assert.equal(await page.title(), titles.get('/agenda/fotoshoot-de-haan-2026'));
    const dynamicSchema = await page.$eval('script[data-dynamic]', el => JSON.parse(el.textContent));
    assert.equal(dynamicSchema.filter(schema => schema['@type'] === 'Event').length, 1);
    assert.equal(dynamicSchema.find(schema => schema['@type'] === 'Event').url, 'https://hondaanzee.be/agenda/fotoshoot-de-haan-2026');
    assert.equal(await page.$('meta[property="og:image:width"]'), null);
    await page.goto(base + '/losloopzones');
    await page.waitForSelector('.leaflet-container');
    await page.goto(base + '/koksijde');
    await page.evaluate(() => { history.pushState(null, '', '/community'); dispatchEvent(new PopStateEvent('popstate')); });
    await page.waitForFunction(() => document.querySelector('h1')?.textContent === '404' && document.querySelector('meta[name=robots]')?.content.includes('noindex'));
    assert.equal(await page.title(), 'Pagina niet gevonden | HondAanZee.be');
    assert.deepEqual(errors, []);
    console.log('JavaScript: matching SEO, working Leaflet and client 404/noindex; no runtime errors: OK.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exit(1); });
