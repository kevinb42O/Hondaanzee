const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { EVENTS, CITIES, loadTsModule } = require('./place-data.cjs');
const { getEventSEO, getEventStructuredData, getRelatedEvents, getUpcomingEvents, isEventPast } = loadTsModule('utils/events.ts');
const { escapeHtml } = require('./static-html.cjs');
const root = path.resolve(__dirname, '../dist');
const now = new Date();
const read = route => fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
const hrefs = html => new Set([...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match => match[1]));
const schemas = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => {
  const value = JSON.parse(match[1]);
  return Array.isArray(value) ? value : value['@graph'] || [value];
});
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const agendaHtml = read('/agenda');
const agendaLinks = hrefs(agendaHtml);
assert(!schemas(agendaHtml).some(schema => schema['@type'] === 'Event'), 'The agenda must list links to individual event pages');
const rows = [];
const descriptions = new Set();
for (const event of EVENTS) {
  const route = `/agenda/${event.slug}`;
  const html = read(route).replace(/&#x27;/g, '&#39;');
  const links = hrefs(html);
  const seo = getEventSEO(event, now);
  const objects = schemas(html);
  const eventSchemas = objects.filter(schema => schema['@type'] === 'Event');
  assert.equal(eventSchemas.length, 1, `Exactly one Event: ${route}`);
  assert.deepEqual(eventSchemas[0], JSON.parse(JSON.stringify(getEventStructuredData(event, now))), `Schema matches source data: ${route}`);
  assert(html.includes(`<title>${escapeHtml(seo.title)}</title>`), `Edition title: ${route}`);
  assert(html.includes(`<meta name="description" content="${escapeHtml(seo.description)}">`), `Description: ${route}`);
  assert(!descriptions.has(seo.description), `Unique description: ${route}`);
  descriptions.add(seo.description);
  assert(seo.description.length <= 200, `Concise description: ${route}`);
  assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, `Canonical count: ${route}`);
  assert(html.includes(`<link rel="canonical" href="${seo.canonical}">`), `Canonical: ${route}`);
  assert(!/<meta name="robots" content="noindex/.test(html), `Indexable: ${route}`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Single page heading: ${route}`);
  assert(new RegExp(`datetime="${event.date}"`, 'i').test(html), `Semantic date: ${route}`);
  assert(objects.some(schema => schema['@type'] === 'WebPage' && schema['@id'] === `${seo.canonical}#webpage`), `Linked WebPage: ${route}`);
  assert(objects.some(schema => schema['@type'] === 'BreadcrumbList' && schema['@id'] === `${seo.canonical}#breadcrumb`), `Breadcrumb: ${route}`);
  for (const text of [event.title, event.dateDisplay, event.cityName, event.location, event.price, event.dogPolicy].filter(Boolean)) {
    assert(html.includes(escapeHtml(text)), `Visible factual information (${text}): ${route}`);
  }
  assert(agendaLinks.has(route), `Initial agenda HTML links to ${route}`);
  assert(sitemap.includes(`<loc>${seo.canonical}</loc>`), `Sitemap includes ${route}`);
  for (const related of getRelatedEvents(event, EVENTS, now)) assert(links.has(`/agenda/${related.slug}`), `Related event discovery: ${route}`);
  if (event.ticketUrl) assert(links.has(escapeHtml(event.ticketUrl)), `Offer URL must be a visible link: ${route}`);
  if (event.image?.startsWith('/')) {
    assert(fs.existsSync(path.join(root, event.image)), `Crawlable local image: ${route}`);
    assert(html.includes(`content="${escapeHtml(seo.ogImageAlt)}"`), `Photo context: ${route}`);
  }
  rows.push({ url: seo.canonical, title: seo.title, description: seo.description, edition: event.date.slice(0, 4), archived: isEventPast(event, now), country: event.country || 'BE', eventSchema: true, initialHtml: true, linkedFromAgenda: true, sitemap: true, offer: !!eventSchemas[0].offers });
}
let cityLinks = 0;
for (const event of getUpcomingEvents(EVENTS, now).filter(event => event.citySlug)) {
  assert(CITIES.some(city => city.slug === event.citySlug), `Existing coastal guide: ${event.citySlug}`);
  assert(hrefs(read(`/${event.citySlug}`)).has(`/agenda/${event.slug}`), `City guide links to ${event.slug}`);
  cityLinks++;
}
if (process.argv.includes('--report')) {
  const report = { checkedAt: now.toISOString(), scope: 'Local production build, not a confirmation of Google indexing', events: rows.length, cityLinks, pages: rows };
  fs.mkdirSync(path.resolve(__dirname, '../research'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '../research/agenda-seo-controle-2026-10-03.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(`Verified ${rows.length} event pages: edition metadata, canonical, full initial HTML, one accurate Event, breadcrumbs, sitemap and crawlable agenda links; ${cityLinks} coastal guide links.`);
