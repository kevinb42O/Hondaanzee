const p = require('puppeteer');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const root = path.resolve(__dirname, '../dist');
const shell = fs.readFileSync(path.join(root, 'index.html'));
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    let file = path.join(root, pathname);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
        file = path.join(file, 'index.html');
    if (fs.existsSync(file)) {
        res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
        res.end(fs.readFileSync(file));
        return;
    }
    const isBusiness = /^\/[^/]+\/(hotspots|diensten)\/[^/]+$/.test(pathname);
    res.statusCode = isBusiness ? 404 : 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(shell);
});
const assert = require('node:assert/strict');
const { HOTSPOTS } = require('./place-data.cjs');
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const b = await p.launch({ headless: true, args: ['--no-sandbox'] });
    try {
        const page = await b.newPage();
        await page.setBypassServiceWorker(true);
        await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (req.url().endsWith('/_vercel/insights/script.js'))
                return req.respond({ status: 200, contentType: 'application/javascript', body: `window.__analytics=[];const q=window.vaq||[];window.va=function(t,p){if(t==='beforeSend')window.__beforeSend=p;else window.__analytics.push({type:t,...p});};q.forEach(a=>window.va(...a));` });
            if (!req.url().startsWith(base))
                return req.abort();
            return req.continue();
        });
        await page.setJavaScriptEnabled(false);
        await page.goto(base + '/blankenberge/hotspots/lakaiann');
        assert.equal(await page.$eval('h1', e => e.textContent), 'Lakaiann');
        assert.equal(await page.$eval('link[rel=canonical]', e => e.href), 'https://hondaanzee.be/blankenberge/hotspots/lakaiann');
        await page.goto(base + '/hotspots');
        assert.equal(await page.$$eval('details a[href*="/hotspots/"]', es => es.length), 133);
        console.log('No-JavaScript: full business content, SEO and all 133 directory links OK');
        await page.setJavaScriptEnabled(true);
        await page.setViewport({ width: 1440, height: 1000 });
        await page.goto(base + '/blankenberge/hotspots/lakaiann?utm_source=test#fotos');
        await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Lakaiann' && window.__analytics?.filter(x => x.type === 'pageview').length === 1);
        let views = await page.evaluate(() => window.__analytics.filter(x => x.type === 'pageview'));
        assert.deepEqual(views.map(x => x.path), ['/blankenberge/hotspots/lakaiann']);
        assert.equal(await page.$eval('script[src$="/_vercel/insights/script.js"]', e => e.dataset.disableAutoTrack), '1');
        await page.evaluate((website) => { const link = [...document.querySelectorAll('a')].find(x => x.getAttribute('href') === website); link.addEventListener('click', e => e.preventDefault(), { once: true }); link.click(); }, HOTSPOTS[0].website);
        await page.waitForFunction(() => window.__analytics.some(x => x.type === 'event'));
        let event = await page.evaluate(() => window.__analytics.find(x => x.type === 'event'));
        assert.deepEqual(event.data, { zaak: '/blankenberge/hotspots/lakaiann', actie: 'website' });
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('main > div')).opacity) > .99);
        await page.screenshot({ path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-place-desktop.png'), fullPage: false });
        await page.evaluate(() => document.querySelector('a[href="/hotspots"]').click());
        await page.waitForFunction(() => location.pathname === '/hotspots' && document.querySelector('h1')?.textContent.includes('Hotspots'));
        await page.evaluate(() => document.querySelector('a[href="/blankenberge/hotspots/cozy-moments"]').click());
        await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'COZY Moments');
        views = await page.evaluate(() => window.__analytics.filter(x => x.type === 'pageview'));
        assert.deepEqual(views.map(x => x.path), ['/blankenberge/hotspots/lakaiann', '/hotspots', '/blankenberge/hotspots/cozy-moments']);
        await page.evaluate(() => { history.pushState(null, '', '/blankenberge/hotspots/bestaat-niet'); dispatchEvent(new PopStateEvent('popstate')); });
        await page.waitForFunction(() => document.querySelector('h1')?.textContent === '404');
        assert.equal(await page.$eval('meta[name=robots]', e => e.content), 'noindex, follow');
        await page.evaluate(() => { history.pushState(null, '', '/blankenberge/hotspots/lakaiann'); dispatchEvent(new PopStateEvent('popstate')); });
        await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Lakaiann');
        await page.setViewport({ width: 390, height: 844 });
        await page.goto(base + '/oostende/diensten/dierenarts-frederik-galle');
        await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Dierenarts Frederik Galle');
        const size = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
        assert(size.content <= size.width, `Mobile overflow: ${JSON.stringify(size)}`);
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('main > div')).opacity) > .99);
        await page.screenshot({ path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-place-mobile.png'), fullPage: false });
        assert.deepEqual(errors, []);
        console.log('Browser: unique pageviews on SPA navigation, website event, invalid/valid routes, mobile layout: OK. No runtime errors.');
    }
    finally {
        await b.close();
        server.close();
    }
})().catch(e => { console.error(e); process.exit(1); });
