const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const puppeteer = require('puppeteer');
const { HOTSPOTS, SERVICES } = require('./place-data.cjs');

const dist = path.resolve(__dirname, '../dist');
const mime = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(dist, pathname);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = path.join(dist, 'index.html');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});

(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.on('dialog', dialog => dialog.accept());
    const errors = [];
    const analyticsRequests = [];
    const fakePlaces = [...HOTSPOTS.map(content => ({ kind: 'hotspot', content })), ...SERVICES.map(content => ({ kind: 'service', content }))].map(({kind, content}, index) => ({ id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, kind, legacy_id: content.id, slug: content.slug, city_slug: content.city, version: 1, draft_revision_id: 'initial', published_revision_id: 'initial', draft: {content}, published: {content}, archived_at: null }));
    const savedRequests = [];
    let conflict = false;
    const cors = { 'Access-Control-Allow-Origin': base, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-supabase-api-version, x-admin-access-token', 'Access-Control-Allow-Methods': 'OPTIONS, POST' };
    page.on('pageerror', error => errors.push(error.message));
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/_vercel/insights')) analyticsRequests.push(request.url());
      // Test all admin pages without credentials or requests to real services.
      if (request.url().includes('/auth/v1/logout')) return request.respond({ status: 204, headers: cors });
      if (request.url().includes('/functions/v1/admin-content')) {
        if (request.method() === 'OPTIONS') return request.respond({ status: 204, headers: cors });
        const input = JSON.parse(request.postData());
        if (input.action === 'list') return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({places: fakePlaces}) });
        if (input.action === 'detail') return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({place: fakePlaces.find(place => place.id === input.id)}) });
        savedRequests.push(input);
        if (input.action === 'save') return request.respond({ status: conflict ? 409 : 200, headers: cors, contentType: 'application/json', body: JSON.stringify(conflict ? {error: 'Deze zaak is intussen gewijzigd. Herlaad de laatste versie voordat je opnieuw opslaat.'} : {version: 2, revision_id: 'saved'}) });
        if (input.action === 'create') {
          const place = { ...fakePlaces[0], id: '00000000-0000-4000-8000-000000000999', slug: input.slug, city_slug: input.city, kind: input.kind, published_revision_id: null, published: null, draft: {content: {...input.patch, id: 999, slug: input.slug, city: input.city, tags: [], image: ''}} };
          fakePlaces.push(place);
          return request.respond({ status: 201, headers: cors, contentType: 'application/json', body: JSON.stringify({id: place.id}) });
        }
      }
      if (request.url().includes('/functions/v1/')) return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ reports: [], subscriber_count: 0, logs: [] }) });
      if (!request.url().startsWith(base)) return request.abort();
      return request.continue();
    });
    await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base + '/admin/zaken');
    await page.waitForSelector('input[autocomplete="username"]');
    assert.equal(await page.$('.workspace-table'), null, 'Catalog is gated behind sign in');
    assert.match(await page.$eval('meta[name="robots"]', el => el.content), /noindex/);

    // This synthetic session tests UI navigation only. It has no valid signature
    // and must never be accepted by a real server or used for authorization tests.
    const user = { id: '00000000-0000-4000-8000-000000000001', email: 'admin@hondaanzee.be', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp, aud: 'authenticated', role: 'authenticated' })).toString('base64url'), 'test-only-invalid-signature'].join('.');
    await page.evaluate(session => localStorage.setItem('sb-zpllibfxaizavcvztnut-auth-token', JSON.stringify(session)), { access_token: token, refresh_token: 'test-only', token_type: 'bearer', expires_at: exp, expires_in: 3600, user });
    await page.goto(base + '/admin');
    await page.waitForSelector('.workspace-stats');
    assert.deepEqual(await page.$$eval('.workspace-stat strong', els => els.map(el => Number(el.textContent))), [HOTSPOTS.length + SERVICES.length, HOTSPOTS.length, SERVICES.length]);
    assert.equal(await page.$('header:not(.workspace-topbar)'), null, 'Public header is absent');
    await page.screenshot({ path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-desktop.png'), fullPage: true });
    await page.click('nav a[href="/admin/zaken"]');
    await page.waitForSelector('.workspace-table');
    assert.equal(await page.$$eval('.workspace-table tbody tr', els => els.length), 157);
    await page.type('input[type="search"]', 'Lakaiann');
    await page.waitForFunction(() => document.querySelectorAll('.workspace-table tbody tr').length === 1);
    const expected = HOTSPOTS.find(place => place.name === 'Lakaiann');
    assert.equal(await page.$eval('.workspace-table img', el => el.getAttribute('src')), expected.image);
    assert.equal(await page.$eval('.workspace-table a[aria-label]', el => el.getAttribute('href')), '/blankenberge/hotspots/lakaiann');
    await page.$eval('input[type="search"]', input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Onbestaandezaak'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForSelector('.workspace-empty button');
    await page.click('.workspace-empty button');
    await page.waitForFunction(() => document.querySelectorAll('.workspace-table tbody tr').length === 157);
    await page.select('.workspace-filters label:nth-child(3) select', 'service');
    await page.waitForFunction(() => document.querySelectorAll('.workspace-table tbody tr').length === 24);
    const lakaiann = fakePlaces.find(place => place.draft.content.name === 'Lakaiann');
    await page.goto(base + '/admin/zaken/' + lakaiann.id);
    await page.waitForSelector('input[name="name"]');
    assert.equal(await page.$eval('.workspace-legacy-gallery img', el => el.getAttribute('src')), expected.image);
    await page.type('input[name="name"]', ' concept');
    await page.click('.workspace-savebar button');
    await page.waitForSelector('.workspace-success');
    assert.deepEqual(savedRequests.at(-1).patch, {name: 'Lakaiann concept'});
    assert.equal(savedRequests.at(-1).version, 1);
    conflict = true;
    await page.type('input[name="name"]', ' gewijzigd');
    await page.click('.workspace-savebar button');
    await page.waitForSelector('.workspace-error');
    assert.match(await page.$eval('.workspace-error', el => el.textContent), /Herlaad/);
    assert.equal(await page.$eval('input[name="name"]', el => el.value), 'Lakaiann concept gewijzigd');
    conflict = false;
    await page.goto(base + '/admin/zaken/nieuw');
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Nieuwe zaak');
    await page.type('textarea[name="description"]', 'Een hondvriendelijk adres aan zee.');
    await page.type('input[name="address"]', 'Kerkstraat 1');
    await page.type('input[placeholder="naam-van-de-zaak"]', 'nieuwe-zaak');
    await page.click('.workspace-savebar button');
    await page.waitForFunction(() => location.pathname.endsWith('000000000999') && document.querySelector('input[name="name"]')?.value === 'Nieuwe zaak');
    assert.equal(savedRequests.at(-1).action, 'create');
    assert.equal(savedRequests.at(-1).slug, 'nieuwe-zaak');
    assert.equal(savedRequests.at(-1).patch.type, 'Café');
    await page.setViewport({width:390,height:844});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile editor has no horizontal overflow');
    await page.screenshot({path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-editor-mobile.png'), fullPage: true});
    await page.setViewport({width:1440,height:1000});
    await page.goto(base + '/admin/zaken/' + lakaiann.id);
    await page.waitForSelector('input[name="name"]');
    await page.screenshot({path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-editor-desktop.png'), fullPage: true});
    await page.click('nav a[href="/admin/analytics"]');
    await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Analytics');
    assert.match(await page.$eval('.workspace-empty', el => el.textContent), /geen eigen meetgegevens/);
    for (const route of ['/admin/meldpunt', '/admin/log', '/admin/notificaties']) {
      await page.goto(base + route);
      await page.waitForSelector('.admin-title');
      assert.match(await page.$eval('meta[name="robots"]', el => el.content), /noindex/);
    }
    await page.goto(base + '/_meldpunt-admin');
    await page.waitForFunction(() => location.pathname === '/admin/meldpunt' && document.querySelector('.admin-title'));
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(base + '/admin');
    await page.waitForSelector('.workspace-stats');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile layout has no horizontal overflow');
    await page.screenshot({ path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-mobile.png'), fullPage: true });
    await page.click('.workspace-sidebar-footer button');
    await page.waitForFunction(() => document.querySelector('input[autocomplete="username"]') || document.querySelector('.workspace-error'), { timeout: 10000 });
    assert.equal(await page.$('.workspace-error'), null, await page.$eval('body', el => el.textContent));
    assert.equal(await page.$('.workspace-stats'), null, 'Sign out removes the dashboard');
    assert.deepEqual(analyticsRequests, [], 'Admin navigation sends no Vercel analytics requests');
    assert.deepEqual(errors, []);
    console.log('Admin browser checks passed: sign-in gate, database catalog/filtering, draft save, conflict handling, new draft, original images and URLs, legacy routes, noindex, mobile, sign out, no analytics requests.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
