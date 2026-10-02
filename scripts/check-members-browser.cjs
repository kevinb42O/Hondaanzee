const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const puppeteer = require('puppeteer');

const dist = path.resolve(__dirname, '../dist');
const screenshots = path.resolve(__dirname, '../.admin-local/member-preview');
fs.mkdirSync(screenshots, { recursive: true });
const mime = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(dist, pathname);
  if (/^\/(account|admin(?:\/.*)?|uitstap\/.*)$/.test(pathname)) file = path.join(dist, 'private.html');
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { if (pathname.endsWith('.js')) console.error('Missing asset during browser checks:', pathname); file = path.join(dist, 'spa.html'); }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
const id = 'f0000000-0000-4000-8000-000000000001';
const user = { id, email: 'member@example.invalid', email_confirmed_at: null, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-10-02T18:00:00Z' };
const exp = Math.floor(Date.now() / 1000) + 3600;
// Invalid synthetic session used only with intercepted requests; never a server
// authorization test. RLS is tested separately with actual database roles.
const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: id, exp, aud: 'authenticated', role: 'authenticated' })).toString('base64url'), 'invalid-test-signature'].join('.');
const session = { access_token: token, refresh_token: 'invalid-test-refresh', token_type: 'bearer', expires_at: exp, expires_in: 3600, user };
const profile = { id, email: user.email, email_confirmed_at: user.email_confirmed_at, display_name: '', home_city: null, status: 'active', created_at: user.created_at, last_active_at: null };
const tables = { member_profiles: [profile], member_favorites: [], member_towns: [], member_dogs: [], member_trips: [], member_trip_places: [] };

(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [], authRequests = [], blockedExternal = [];
    page.on('pageerror', e => errors.push(e.message));
    const cors = { 'Access-Control-Allow-Origin': base, 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PATCH,DELETE' };
    let failNextSave = false;
    let admin = false;
    let deleted = false;
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request', req => {
      const url = new URL(req.url()), method = req.method();
      if (url.pathname.startsWith('/_vercel/')) return req.respond({ status: 200, contentType: 'application/javascript', body: '' });
      const send = (value, status = 200) => req.respond({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(value) });
      if (url.hostname.endsWith('supabase.co')) {
        if (method === 'OPTIONS') return send({});
        if (url.pathname === '/auth/v1/signup' || url.pathname === '/auth/v1/token') {
          const input = JSON.parse(req.postData()); authRequests.push({path: url.pathname, ...input});
          if (input.password === 'wrong-password') return send({code: 'invalid_credentials', msg: 'Invalid login credentials'}, 400);
          return send(session);
        }
        if (url.pathname === '/auth/v1/user') return send(user);
        if (url.pathname === '/auth/v1/logout') return req.respond({ status: 204, headers: cors });
        if (url.pathname === '/rest/v1/rpc/record_member_visit') return send(null);
        if (url.pathname === '/rest/v1/rpc/read_shared_trip') {
          const input = JSON.parse(req.postData());
          const trip = tables.member_trips.find(t => t.share_token && t.share_token === input.p_token);
          return send(trip ? { title: trip.title, trip_date: trip.trip_date, places: tables.member_trip_places.filter(p => p.trip_id === trip.id).map(({ kind, city_slug, place_slug }) => ({ kind, city_slug, place_slug })) } : null);
        }
        if (url.pathname === '/functions/v1/admin-members') {
          const input = JSON.parse(req.postData());
          if (!admin) return send({ error: 'Je account heeft geen toegang tot het beheer.' }, 403);
          if (input.action === 'access') return send({ allowed: true });
          const member = { ...profile, favorites_count: tables.member_favorites.length, trips_count: tables.member_trips.length };
          if (input.action === 'list') return send({ members: input.search && !`${profile.email} ${profile.display_name}`.toLowerCase().includes(input.search.toLowerCase()) ? [] : [member], total: input.search && !`${profile.email} ${profile.display_name}`.toLowerCase().includes(input.search.toLowerCase()) ? 0 : 1, stats: { total: 1, new30: 1, active30: 1, saved: tables.member_favorites.length ? 1 : 0 } });
          if (input.action === 'detail') return send({ member, dogs: tables.member_dogs, towns: tables.member_towns, favorites_count: member.favorites_count, trips_count: member.trips_count });
          if (input.action === 'status') { profile.status = input.status; return send({ ok: true }); }
        }
        if (url.pathname === '/functions/v1/member-account') { deleted = true; return send({ ok: true }); }
        if (url.pathname === '/rest/v1/reports' || url.pathname === '/rest/v1/reviews') return send([]);
        const table = url.pathname.replace('/rest/v1/', '');
        if (table in tables) {
          const filter = rows => rows.filter(row => [...url.searchParams].every(([key, value]) => !value.startsWith('eq.') || String(row[key]) === value.slice(3)));
          let result;
          if (method === 'GET') result = filter(tables[table]);
          if (method === 'POST') {
            if (failNextSave && table === 'member_favorites') { failNextSave = false; return send({ message: 'Test unavailable', code: 'XX000' }, 503); }
            const input = JSON.parse(req.postData()), row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), note: '', trip_date: null, share_token: null, ...input };
            tables[table].push(row); result = [row];
          }
          if (method === 'PATCH') { const input = JSON.parse(req.postData()); result = filter(tables[table]); result.forEach(row => Object.assign(row, input)); }
          if (method === 'DELETE') { const removed = new Set(filter(tables[table])); tables[table] = tables[table].filter(row => !removed.has(row)); result = [...removed]; if (table === 'member_trips') tables.member_trip_places = tables.member_trip_places.filter(p => !removed.has(tables.member_trips.find(t => t.id === p.trip_id))); }
          const singular = req.headers().accept?.includes('vnd.pgrst.object');
          return send(singular ? result[0] : result);
        }
        return send({ error: 'Unexpected mocked API path' }, 500);
      }
      if (!req.url().startsWith(base)) { blockedExternal.push(req.url()); return req.abort(); }
      return req.continue();
    });
    await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base + '/account?mode=register');
    await page.waitForSelector('.member-auth-card');
    assert.match(await page.title(), /Mijn Hond aan Zee/);
    assert.match(await page.$eval('meta[name=robots]', el => el.content), /noindex/);
    await page.screenshot({ path: path.join(screenshots, 'registration-desktop.png'), fullPage: false });
    await page.setViewport({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(screenshots, 'registration-mobile.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    // A first save survives signup and returns the member to the original place.
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base + '/blankenberge/hotspots/lakaiann');
    await page.waitForSelector('button.member-save');
    await page.click('button.member-save');
    await page.waitForSelector('.member-pending-save');
    await page.type('input[name=email]', user.email);
    await page.click('input[name=terms]');
    await page.type('input[name=password]', 'Zand tussen poten 42');
    await page.type('input[name=password-repeat]', 'different password');
    await page.click('.member-auth-card form button[type=submit], .member-auth-card form > button');
    await page.waitForSelector('.member-error');
    assert.match(await page.$eval('.member-error', el => el.textContent), /komen niet overeen/);
    assert.equal(authRequests.length, 0, 'Mismatched passwords never reach the backend');
    await page.click('button[aria-label="Toon wachtwoord"]');
    assert.equal(await page.$eval('input[name=password]', el => el.type), 'text');
    await page.click('button[aria-label="Verberg wachtwoord"]');
    await page.$eval('input[name=password-repeat]', input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Zand tussen poten 42'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('.member-auth-card form > button');
    await page.waitForFunction(() => location.pathname === '/blankenberge/hotspots/lakaiann' && document.querySelector('.member-save')?.getAttribute('aria-pressed') === 'true');
    assert.equal(authRequests[0].path, '/auth/v1/signup');
    assert.equal(authRequests[0].password, 'Zand tussen poten 42');
    assert.equal(tables.member_favorites.length, 1);
    assert.equal(await page.evaluate(() => localStorage.getItem('haz-pending-save-v1')), null);
    await page.goto(base + '/account?tab=settings');
    await page.waitForSelector('.member-settings-grid');
    await clickText(page, 'button', 'Uitloggen');
    await page.waitForSelector('.member-auth-card');
    await clickText(page, '.member-auth-tabs button', 'Inloggen');
    assert.equal(await page.$('input[name=password-repeat]'), null);
    assert.equal(await page.$eval('input[name=password]', el => el.autocomplete), 'current-password');
    await page.type('input[name=email]', user.email);
    await page.type('input[name=password]', 'wrong-password');
    await page.click('.member-auth-card form > button');
    await page.waitForSelector('.member-error');
    assert.match(await page.$eval('.member-error', el => el.textContent), /wachtwoord klopt niet/);
    await page.$eval('input[name=password]', input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Zand tussen poten 42'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('.member-auth-card form > button');
    await page.waitForSelector('.member-dashboard');
    assert.equal(authRequests.at(-1).path, '/auth/v1/token');

    await page.goto(base + '/account?tab=settings');
    await page.waitForSelector('input[name=display-name]');
    await page.type('input[name=display-name]', 'Sofie');
    await page.select('select[name=home-city]', 'de-haan');
    await page.click('.member-settings-grid form button');
    await page.waitForFunction(() => document.querySelector('.member-dashboard-heading h1')?.textContent.includes('Sofie'));
    await clickText(page, 'button', 'Hond toevoegen');
    await page.waitForSelector('dialog[open] input[name=dog-name]');
    await page.type('input[name=dog-name]', 'Milo');
    await page.type('input[name=dog-breed]', 'Vrolijke mix');
    await clickText(page, 'dialog button', 'Bewaar hondenprofiel');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    assert.equal(tables.member_dogs[0].name, 'Milo');

    await clickText(page, '.member-dashboard-nav button', 'Mijn kust');
    await page.waitForSelector('button[aria-label="Volg De Haan"]');
    await page.click('button[aria-label="Volg De Haan"]');
    await page.waitForSelector('button[aria-label="Ontvolg De Haan"]');
    assert.equal(tables.member_towns.length, 1);
    await clickText(page, '.member-dashboard-nav button', 'Mijn overzicht');
    await page.waitForSelector('.member-town-summary');
    await page.screenshot({ path: path.join(screenshots, 'dashboard-desktop.png'), fullPage: false });
    await page.setViewport({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(screenshots, 'dashboard-mobile.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    await page.setViewport({ width: 1440, height: 1000 });
    await clickText(page, '.member-dashboard-nav button', 'Mijn uitstapjes');
    await clickText(page, 'button', 'Nieuwe uitstap');
    await page.waitForSelector('dialog[open] input[name=trip-title]');
    await page.type('dialog input[name=trip-title]', 'Weekend met Milo');
    await clickText(page, 'dialog button', 'Maak mijn uitstap');
    await page.waitForSelector('dialog.member-dialog-wide[open]');
    await page.type('textarea[name=trip-note]', 'PRIVATE: do not share this personal note');
    await page.$eval('input[name=trip-date]', input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, '2026-10-10'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await clickText(page, 'dialog button', 'Wijzigingen bewaren');
    await page.waitForFunction(() => document.querySelector('.member-toast')?.textContent.includes('bijgewerkt'));
    await clickText(page, 'dialog button', 'Kies een plek');
    await page.waitForSelector('button[aria-label="Voeg Lakaiann toe aan uitstap"]');
    await page.click('button[aria-label="Voeg Lakaiann toe aan uitstap"]');
    await page.waitForSelector('.member-trip-place-list');
    await clickText(page, 'dialog button', 'Maak een deelbare link');
    await page.waitForSelector('input[aria-label="Deelbare uitstaplink"]');
    const sharedUrl = await page.$eval('input[aria-label="Deelbare uitstaplink"]', el => el.value);
    await page.screenshot({ path: path.join(screenshots, 'trip-editor-desktop.png'), fullPage: false });
    await page.click('button[aria-label="Venster sluiten"]');
    await page.goto(sharedUrl);
    await page.waitForSelector('.member-shared h1');
    assert.equal(await page.$eval('.member-shared h1', el => el.textContent), 'Weekend met Milo');
    assert.equal(await page.evaluate(() => document.body.innerText.includes('PRIVATE:')), false);
    assert.equal(await page.evaluate(() => document.body.innerText.includes('member@example.invalid')), false);

    // A normal member must not mount any admin page or issue admin data calls.
    await page.goto(base + '/admin/leden');
    await page.waitForFunction(() => document.querySelector('.workspace-empty h1')?.textContent.includes('geen beheertoegang'));
    assert.equal(await page.$('.workspace-members-table'), null);

    // Admin view and searching use a separately authorized mocked server answer.
    admin = true;
    await page.goto(base + '/admin/leden');
    await page.waitForSelector('.workspace-members-table');
    await page.screenshot({ path: path.join(screenshots, 'admin-members-desktop.png'), fullPage: false });
    await page.type('input[type=search]', 'missing-member');
    await page.waitForFunction(() => document.querySelector('.workspace-empty h2')?.textContent === 'Geen leden gevonden');

    // A failed favorite mutation must not claim success or change the saved state.
    admin = false;
    await page.goto(base + '/de-haan/hotspots/restaurant-de-concessie');
    // Use an actual catalog URL if this historical example changed.
    if (!await page.$('button.member-save')) { await page.goto(base + '/hotspots'); await page.waitForSelector('button.member-save'); }
    const unsaved = await page.$('button.member-save[aria-pressed=false]');
    assert.ok(unsaved); failNextSave = true;
    await unsaved.click();
    await page.waitForFunction(() => document.querySelector('.member-toast')?.textContent.includes('niet gelukt'));
    assert.equal(tables.member_favorites.length, 1);

    await page.goto(base + '/account?tab=trips');
    await page.waitForSelector('.member-trip-card');
    await page.click('.member-trip-card');
    await page.waitForSelector('dialog[open]');
    await clickText(page, 'dialog button', 'Stop delen');
    await page.waitForFunction(() => !document.querySelector('input[aria-label="Deelbare uitstaplink"]'));
    await page.click('button[aria-label="Venster sluiten"]');
    await page.goto(sharedUrl);
    await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Deze uitstap wordt niet meer gedeeld.');

    await page.goto(base + '/account?tab=settings');
    await page.waitForSelector('.member-delete-row');
    await clickText(page, '.member-delete-row button', 'Account verwijderen');
    await page.type('dialog input[type=email]', user.email);
    await page.type('dialog input[pattern=VERWIJDER]', 'VERWIJDER');
    await clickText(page, 'dialog button', 'Verwijder mijn account');
    await page.waitForSelector('.member-auth-card');
    assert.equal(deleted, true);
    assert.equal(await page.evaluate(() => localStorage.getItem('sb-zpllibfxaizavcvztnut-auth-token')), null);
    assert.deepEqual(errors, []);
    console.log('Members: first save through signup, profile and dogs, town following, trip editing, private notes, share revocation, admin denial, member search, failed-save handling, account deletion, responsive layouts and zero runtime errors: OK.');
    console.log(`Screenshots: ${screenshots}`);
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

async function clickText(page, selector, text) {
  const buttons = await page.$$(selector);
  for (const button of buttons) if ((await button.evaluate(el => el.textContent)).includes(text)) { await button.click(); return; }
  throw new Error(`Button not found: ${text}`);
}
