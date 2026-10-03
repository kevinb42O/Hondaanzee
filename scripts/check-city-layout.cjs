const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const puppeteer = require('puppeteer');
const { CITIES, HOTSPOTS, loadTsModule } = require('./place-data.cjs');
const { getBeachRuleDay, getBeachDayAnswer, evaluateCityRuleStatus, getBeachAnswer } = loadTsModule('utils/rules.ts');
const root = path.resolve(__dirname, '../dist');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const route = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(root, route);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.statusCode = 404; file = path.join(root, '404.html'); }
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
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
    await page.setRequestInterception(true);
    page.on('request', req => req.url().startsWith(base) ? req.continue() : req.abort());
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // The editorial CSS must be present in prerendered HTML before JS mounts.
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 1440, height: 1000 });
    for (const city of CITIES) {
      await page.goto(`${base}/${city.slug}`, { waitUntil: 'load' });
      const initial = await page.$eval('.city-hero', el => ({
        position: getComputedStyle(el).position,
        titleX: el.querySelector('h1').getBoundingClientRect().x,
        text: el.textContent,
      }));
      assert.equal(initial.position, 'relative', `${city.slug}: prerender missing city stylesheet`);
      assert(initial.titleX >= 40, `${city.slug}: prerender title touches viewport edge`);
      assert(initial.text.includes('De actuele status wordt in je browser berekend.'), `${city.slug}: prerender freezes a live status`);
      for (const source of city.rules.sources) assert(await page.$(`a[href="${source.url}"]`), `${city.slug}: source missing without JS`);
    }
    await page.setJavaScriptEnabled(true);

    let layouts = 0;
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewport({ width, height: 1000 });
      for (const city of CITIES) {
        await page.goto(`${base}/${city.slug}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.city-zone-row');
        const layout = await page.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, right: r.right, y: r.y, width: r.width }; };
          const page = document.querySelector('.city-page');
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            title: rect('.city-hero h1'), answer: rect('[data-beach-answer]'),
            back: rect('.city-back-link'), zones: rect('.city-beach-zones'),
            heroColumns: getComputedStyle(document.querySelector('.city-hero-grid')).gridTemplateColumns.split(' ').length,
            headings: page.querySelectorAll('h1').length,
            text: page.querySelector('h1').textContent,
            floatingSupport: [...document.querySelectorAll('a[aria-label="Steun ons"]')].some(el => getComputedStyle(el).position === 'fixed'),
            closedAnnual: !page.querySelector('[data-beach-annual-reference]').open,
          };
        });
        assert.equal(layout.headings, 1, `${city.slug}/${width}: multiple main headings`);
        assert(layout.text.includes(city.name), `${city.slug}/${width}: truncated city name`);
        assert.equal(layout.overflow, 0, `${city.slug}/${width}: horizontal overflow`);
        assert(layout.answer.x >= 19 && layout.answer.right <= width - 19, `${city.slug}/${width}: answer clips outer gutter`);
        assert(layout.answer.width <= 641, `${city.slug}/${width}: oversized card grows without limit`);
        assert.equal(layout.heroColumns, width >= 1100 ? 2 : 1, `${city.slug}/${width}: squeezed hero columns`);
        if (width >= 1100 || width < 640) {
          assert(Math.abs(layout.title.x - layout.back.x) < 1, `${city.slug}/${width}: title and navigation misaligned`);
          assert(Math.abs(layout.title.x - layout.zones.x) < 1, `${city.slug}/${width}: hero and rules misaligned`);
        }
        if (width < 640) assert(layout.answer.y < 500, `${city.slug}/${width}: mobile answer buried below introduction`);
        assert(!layout.floatingSupport, `${city.slug}/${width}: floating support obscures answer`);
        assert(layout.closedAnnual, `${city.slug}/${width}: annual reference starts open`);
        layouts++;
      }
    }

    // Exercise real planning and keyboard controls, checking the rule engine's answer.
    await page.setViewport({ width: 390, height: 844 });
    const statuses = new Set();
    for (const city of CITIES) {
      await page.goto(`${base}/${city.slug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.city-zone-row');
      await page.focus('.city-visit-switch button:last-child');
      await page.keyboard.press('Space');
      await page.waitForSelector('#city-visit-date');
      for (const date of ['2027-01-15', '2027-07-15']) {
        const { day } = getBeachRuleDay(city, date);
        assert(day, `${city.slug}: fixture date cannot be evaluated`);
        statuses.add(day.status);
        await page.$eval('#city-visit-date', (el, value) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, date);
        await page.waitForFunction(expected => document.querySelector('.city-answer-summary').textContent === expected, {}, getBeachDayAnswer(day));
        assert.equal(await page.$eval('.city-answer-value', el => el.textContent), day.status === 'DEELS' ? 'JA' : day.status === 'INFO' ? 'ONBEKEND' : day.status);
        for (const source of city.rules.sources) assert(await page.$(`a[href="${source.url}"]`), `${city.slug}: source lost during planning`);
      }
      await page.focus('.city-visit-switch button:first-child');
      await page.keyboard.press('Space');
      await page.waitForFunction(() => !document.querySelector('#city-visit-date'));
      await page.focus('.city-faq-question');
      await page.keyboard.press('Enter');
      assert.equal(await page.$eval('.city-faq-question', el => el.getAttribute('aria-expanded')), 'true');
      assert.equal(await page.$eval('.city-faq-answer', el => el.hidden), false);
      await page.focus('[data-beach-annual-reference] summary');
      await page.keyboard.press('Space');
      assert.equal(await page.$eval('[data-beach-annual-reference]', el => el.open), true);
    }
    assert(statuses.has('JA') && statuses.has('DEELS'), 'Planning did not cover permitted and changing full-day rules');

    // Nieuwpoort permits visits outside summer daytime hours: a full day is
    // conditional, while the current answer at summer noon must be NEE.
    const deniedPage = await browser.newPage();
    await deniedPage.setBypassServiceWorker(true);
    await deniedPage.setViewport({ width: 390, height: 844 });
    await deniedPage.setRequestInterception(true);
    deniedPage.on('request', req => req.url().startsWith(base) ? req.continue() : req.abort());
    await deniedPage.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined });
      const NativeDate = Date;
      const fixed = NativeDate.parse('2027-07-15T12:00:00Z');
      window.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [fixed])); }
        static now() { return fixed; }
      };
    });
    await deniedPage.goto(`${base}/nieuwpoort`, { waitUntil: 'domcontentloaded' });
    await deniedPage.waitForFunction(() => document.querySelector('.city-answer-value')?.textContent === 'NEE');
    const denied = evaluateCityRuleStatus(CITIES.find(city => city.slug === 'nieuwpoort'), new Date('2027-07-15T12:00:00Z'));
    assert.equal(await deniedPage.$eval('.city-answer-summary', el => el.textContent), getBeachAnswer(denied));
    await deniedPage.close();

    await page.goto(`${base}/oostende`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#hotspots .city-filter');
    const filter = await page.$eval('#hotspots .city-filter:nth-child(2)', el => el.textContent);
    await page.click('#hotspots .city-filter:nth-child(2)');
    const expectedCount = HOTSPOTS.filter(spot => spot.city === 'oostende' && (spot.type === filter || spot.tags.includes(filter))).length;
    assert.equal(await page.$$eval('#hotspots .city-places-grid > div', els => els.length), Math.min(6, expectedCount), 'Hotspot filter count changed');
    const more = await page.$('#hotspots .city-button');
    if (expectedCount > 6) {
      await more.click();
      assert.equal(await page.$$eval('#hotspots .city-places-grid > div', els => els.length), expectedCount, 'Show all hotspots loses places');
    }
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log(`${CITIES.length} city pages: prerender CSS and sources, ${layouts} responsive layouts, winter/summer planning, keyboard FAQ/reference and hotspot filtering: OK.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
