const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { CITIES, loadTsModule } = require('./place-data.cjs');
const { getAnnualBeachRuleSections, getAnnualBeachRuleText } = loadTsModule('utils/rules.ts');
const { HOME_FAQ_SCHEMA } = loadTsModule('data/homeFaq.ts');
const root = path.join(__dirname, '..', 'dist');
const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const schemas = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const flattenSchemas = entry => Array.isArray(entry) ? entry.flatMap(flattenSchemas) : entry['@graph'] ? flattenSchemas(entry['@graph']) : [entry];
const findFaq = entries => flattenSchemas(entries).find(entry => entry['@type'] === 'FAQPage');
for (const city of CITIES) {
  const html = fs.readFileSync(path.join(root, city.slug, 'index.html'), 'utf8');
  for (const section of getAnnualBeachRuleSections(city.rules)) assert(html.includes(escapeHtml(section.rule)), `${city.slug}: missing complete annual rule ${section.label}`);
  for (const source of city.rules.sources) assert(html.includes(`href="${escapeHtml(source.url)}"`), `${city.slug}: missing official source link`);
  assert(html.includes('3 oktober 2026'), `${city.slug}: missing verified date`);
  assert(html.includes('De actuele status wordt in je browser berekend.'), `${city.slug}: frozen current status in prerender`);
  assert(/<details[^>]*data-beach-annual-reference/.test(html) && !/<details[^>]*open[^>]*data-beach-annual-reference/.test(html), `${city.slug}: annual rules must start collapsed`);
  assert(html.includes('Plan je bezoek') && html.includes('Bronnen en laatste controle'), `${city.slug}: missing visit planner or immediately available sources`);
  assert(!/type="time"/.test(html), `${city.slug}: beach planner must not require an hour`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${city.slug}: competing main answers`);
  const faq = findFaq(schemas(html));
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, getAnnualBeachRuleText(city.rules).replace(/\s+/g, ' ').trim(), `${city.slug}: divergent FAQ schema`);
}
assert.deepEqual(findFaq(schemas(fs.readFileSync(path.join(root, 'index.html'), 'utf8'))), JSON.parse(JSON.stringify(HOME_FAQ_SCHEMA)), 'Home FAQ schema differs from visible source');
const exported = fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8');
const conciseExport = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
assert(exported.includes('alleen een datum') && conciseExport.includes('alleen een datum'), 'AI exports still require an hour for visit planning');
for (const city of CITIES) {
  assert(exported.includes(getAnnualBeachRuleText(city.rules)), `${city.slug}: incomplete AI export`);
  assert(conciseExport.includes(city.description), `${city.slug}: divergent AI summary`);
  assert(exported.includes(`Gecontroleerd: ${city.rules.lastVerifiedAt}`), `${city.slug}: missing AI verification date`);
  for (const source of city.rules.sources) assert(exported.includes(source.url), `${city.slug}: missing AI source`);
}
const publicSafety = fs.readFileSync(path.join(root, 'goed-om-te-weten', 'index.html'), 'utf8');
assert(!/0800 99 899|059 34 21 41|tel:080099899|tel:059342141/.test(publicSafety), 'Outdated seal phone numbers remain public');
assert(publicSafety.includes('tel:+32477345890') && publicSafety.includes('tel:+32491743278'), 'Missing verified seal contact links');
const updates = fs.readFileSync(path.join(root, 'updates', 'index.html'), 'utf8');
assert(updates.includes('Strandgids: de juiste regels voor jouw moment en strandzone') && updates.includes('De historiek hieronder is geen actuele strandregeling.'), 'Updates page missing current beach guide release or historical context');
console.log(`Verified ${CITIES.length} complete public beach pages, official sources, stable FAQ schema, AI export and seal contacts.`);
