const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '../dist');
const shell = fs.readFileSync(path.join(root, 'index.html'));
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  let file = path.join(root, new URL(req.url, 'http://localhost').pathname);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'text/html');
  res.end(fs.existsSync(file) ? fs.readFileSync(file) : shell);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    const scripts = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
    await page.setBypassServiceWorker(true);
    await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().endsWith('/_vercel/insights/script.js')) return request.respond({ status: 200, contentType: 'application/javascript', body: 'window.va = () => {};' });
      return request.url().startsWith(base) && request.resourceType() !== 'media' ? request.continue() : request.abort();
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base);
    await page.waitForSelector('input[role="combobox"]');

    // Locate the actual search-engine chunk, excluding Lucide's search-icon chunk.
    const searchChunks = fs.readdirSync(path.join(root, 'assets')).filter(name => /^search-.*\.js$/.test(name) && fs.readFileSync(path.join(root, 'assets', name), 'utf8').includes('brasserie-la-potiniere'));
    assert.equal(searchChunks.length, 1, 'Expected a separately loaded search engine');
    assert(!scripts.some(url => url.endsWith(searchChunks[0])), 'Search engine loaded before interaction');

    const typeQuery = async query => {
      await page.focus('input[role="combobox"]');
      // Selecting the native input works on every test host.
      await page.$eval('input[role="combobox"]', input => input.select());
      await page.keyboard.type(query);
    };
    await typeQuery('de potiniere');
    await page.waitForFunction(() => document.querySelector('[role="option"]')?.textContent.includes('Brasserie La Potinière'));
    assert(scripts.some(url => url.endsWith(searchChunks[0])), 'Search did not load on interaction');
    assert.equal(await page.$eval('input[role="combobox"]', input => input.getAttribute('aria-autocomplete')), 'list');
    await page.keyboard.press('ArrowDown');
    assert(await page.$eval('input[role="combobox"]', input => document.getElementById(input.getAttribute('aria-activedescendant'))?.getAttribute('aria-selected') === 'true'));
    await page.screenshot({ path: '/tmp/hondaanzee-search-desktop.png' });
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => location.pathname === '/de-haan/hotspots/brasserie-la-potiniere' && document.querySelector('h1')?.textContent === 'Brasserie La Potinière');
    await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Terug').click());
    await page.waitForFunction(() => document.querySelector('input[role="combobox"]')?.value === 'de potiniere' && document.querySelector('[data-search-result="hotspot:brasserie-la-potiniere"]'));
    assert.equal(new URL(page.url()).searchParams.get('search'), 'de potiniere');
    await page.reload();
    await page.waitForSelector('[data-search-result="hotspot:brasserie-la-potiniere"]');
    console.log('Desktop: deferred search, Potinière suggestions, keyboard selection, direct navigation, return and reload OK.');

    await typeQuery('De Haan');
    await page.waitForFunction(() => document.querySelector('[role="option"]')?.textContent.startsWith('De Haan'));
    assert((await page.$$('[role="option"]')).length <= 8);
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('input[role="combobox"]', input => input.getAttribute('aria-expanded')), 'false');
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).pathname, '/');
    await page.waitForFunction(() => !document.querySelector('[role="listbox"]'));
    const enterResults = await page.$$eval('[data-search-result]', links => links.map(link => link.getAttribute('href')));
    await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Zoeken').click());
    assert.deepEqual(await page.$$eval('[data-search-result]', links => links.map(link => link.getAttribute('href'))), enterResults);
    await page.evaluate(() => [...document.querySelectorAll('[data-search-results] button')].find(button => button.textContent.startsWith('Losloopzones')).click());
    assert((await page.$$eval('[data-search-result]', links => links.map(link => link.getAttribute('href')))).every(href => href.startsWith('/losloopzones/')));
    await page.evaluate(() => [...document.querySelectorAll('[data-search-result]')][0].click());
    await page.waitForFunction(() => location.pathname.startsWith('/losloopzones/') && !!document.querySelector('h1'));
    console.log('Results: city ranking, bounded suggestions, Escape, Enter/search-button parity, filters and zone navigation OK.');

    await page.goto(base + '/?search=dierenarts+Oostende');
    await page.waitForSelector('[data-search-result]');
    assert((await page.$$eval('[data-search-result]', links => links.map(link => link.getAttribute('href')))).every(href => href.startsWith('/oostende/diensten/')));
    await page.evaluate(() => document.querySelector('[data-search-result]').click());
    await page.waitForFunction(() => location.pathname.startsWith('/oostende/diensten/') && !!document.querySelector('h1'));

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(base + '/?search=restaurant+De+Haan');
    await page.waitForSelector('[data-search-result="hotspot:brasserie-la-potiniere"]');
    assert((await page.$$eval('[data-search-result]', links => links.map(link => link.getAttribute('href')))).every(href => href.startsWith('/de-haan/hotspots/')));
    await page.focus('input[role="combobox"]');
    await page.waitForSelector('[role="option"]');
    const bounds = await page.$eval('[role="listbox"]', list => {
      const rect = list.parentElement.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: window.innerWidth, height: window.innerHeight };
    });
    assert(bounds.left >= 0 && bounds.right <= bounds.width && bounds.top >= 0 && bounds.bottom <= bounds.height, `Mobile dropdown outside viewport: ${JSON.stringify(bounds)}`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile page overflow');
    await page.screenshot({ path: '/tmp/hondaanzee-search-mobile.png' });
    await page.tap('[role="option"]');
    await page.waitForFunction(() => location.pathname.startsWith('/de-haan/hotspots/') && !!document.querySelector('h1'));

    await page.goto(base + '/?search=zzzzzzzzzzz');
    await page.waitForFunction(() => document.querySelector('[data-search-results]')?.textContent.includes('Geen resultaten gevonden'));
    assert.equal((await page.$$('[data-search-result]')).length, 0);
    await page.evaluate(() => [...document.querySelectorAll('[data-search-results] button')].find(button => button.textContent === 'Wis zoekopdracht').click());
    await page.waitForFunction(() => !location.search && document.querySelector('input[role="combobox"]')?.value === '' && document.querySelector('#steden')?.textContent.includes('Onze Badsteden'));
    assert.deepEqual(errors, []);
    console.log('Mobile: combined queries, service and touch navigation, dropdown fit, no overflow, empty state and reset OK. No runtime errors.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
