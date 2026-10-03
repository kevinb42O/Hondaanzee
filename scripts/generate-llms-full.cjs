const fs = require('node:fs');
const path = require('node:path');
const { loadTsModule, HOTSPOTS, SERVICES, CITIES, blogPosts, EVENTS, OFF_LEASH_AREAS } = require('./place-data.cjs');

const { publicPlaceText } = loadTsModule('supabase/functions/_shared/placeFields.ts');

const { BEACH_RULES_VERIFIED_AT, BEACH_ACCESS_GUIDANCE } = loadTsModule('data/beachRules.ts');
const { HOME_FAQ } = loadTsModule('data/homeFaq.ts');
const { getAnnualBeachRuleText } = loadTsModule('utils/rules.ts');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'llms-full.txt');

let content = `# HondAanZee.be - Volledige Inhoud\n\n`;
content += `> Dit document bevat alle gedetailleerde informatie van HondAanZee.be: alle hondvriendelijke hotspots, diensten, losloopzones, strandregels per gemeente, evenementen en blogartikelen. Dit document is geoptimaliseerd voor LLM's en AI-crawlers om de volledige kennis van de website in één keer te kunnen indexeren.\n\n`;

content += `## Kuststeden en Strandregels\n\n`;
content += `Dit is de volledige jaarregeling, geen live antwoord voor vandaag. De strandgids toont standaard de regels die nu gelden in Belgische tijd. Kies voor een gepland bezoek alleen een datum; het dagoverzicht toont alle toepasselijke regels voor die dag, met uren bij de zones die veranderen. Een dagoverzicht geeft geen algemene toelating wanneer toegang of voorwaarden doorheen de dag verschillen. Bij overlappende periodes geldt de specifiekere periode. Toegang en loslopen zijn afzonderlijke voorwaarden; een actieve reddingsdienst of tijdelijke maatregel kan toegang beperken.\n\n`;
CITIES.forEach(city => {
  content += `### ${city.name}\n`;
  content += `${city.description}\n\n`;
  content += `${getAnnualBeachRuleText(city.rules)}\n\n`;
  content += `Gecontroleerd: ${city.rules.lastVerifiedAt}\n`;
  for (const source of city.rules.sources ?? []) content += `Bron: [${source.title}](${source.url})\n`;
  content += '\n';
});

content += `## Hondvriendelijke Hotspots (Restaurants, Cafés, Hotels)\n\n`;
HOTSPOTS.forEach(spot => { content += publicPlaceText(spot); });

content += `## Diensten (Dierenartsen, Winkels)\n\n`;
SERVICES.forEach(service => { content += publicPlaceText(service); });

content += `## Losloopzones en Hondenweides\n\n`;
OFF_LEASH_AREAS.forEach(area => {
  content += `### ${area.name} (${area.city})\n`;
  content += `Locatie: ${area.locationInfo || area.location}\n`;
  if (area.description) content += `Beschrijving: ${area.description}\n`;
  if (area.fenced) content += `Volledig omheind: Ja\n`;
  if (area.waterAvailable) content += `Zwemwater of drinkwater aanwezig: Ja\n`;
  if (area.tags && area.tags.length > 0) content += `Kenmerken: ${area.tags.join(', ')}\n`;
  content += `\n`;
});

content += `## Blogartikelen (Honden & De Kust)\n\n`;
blogPosts.forEach(blog => {
  content += `### ${blog.title}\n`;
  content += `Ondertitel: ${blog.subtitle}\n`;
  content += `Categorie: ${blog.category}\n\n`;
  
  if (blog.content) {
    blog.content.forEach(sec => {
      if (sec.type === 'heading') content += `#### ${sec.text}\n\n`;
      else if (sec.type === 'subheading') content += `##### ${sec.text}\n\n`;
      else if (sec.type === 'paragraph') content += `${sec.text}\n\n`;
      else if (sec.type === 'list' && sec.items) content += `${sec.items.map(i => `- ${i}`).join('\n')}\n\n`;
      else if ((sec.type === 'tip' || sec.type === 'warning' || sec.type === 'callout') && sec.text) {
        content += `> **${sec.title || sec.type}**: ${sec.text}\n\n`;
      }
    });
  }
});

content += `## Evenementen\n\n`;
EVENTS.forEach(event => {
  content += `### ${event.title}\n`;
  content += `Datum: ${event.dateDisplay} | Locatie: ${event.cityName}\n`;
  content += `Beschrijving: ${event.description}\n`;
  if (event.highlights && event.highlights.length > 0) {
    content += `Highlights:\n${event.highlights.map(h => `- ${h}`).join('\n')}\n`;
  }
  content += `\n`;
});

fs.writeFileSync(OUTPUT_PATH, content);
console.log(`Generated llms-full.txt successfully!`);

const concisePath = path.join(ROOT_DIR, 'public', 'llms.txt');
let concise = fs.readFileSync(concisePath, 'utf8');
const citiesStart = concise.indexOf('## Kustgemeenten');
const blogsStart = concise.indexOf('## Blog', citiesStart);
if (citiesStart < 0 || blogsStart < 0) throw new Error('Missing llms overview boundaries');
concise = concise.slice(0, citiesStart) + `## Kustgemeenten en strandregels\n\n${BEACH_ACCESS_GUIDANCE}\n\nDe strandgids toont standaard de actuele regels in Belgische tijd. Een gepland bezoek vraagt alleen een datum. Het dagoverzicht toont uren bij de strandzones waarvan de regels die dag veranderen.\n\nGecontroleerd op ${BEACH_RULES_VERIFIED_AT}. De volledige jaarregeling en bronlinks staan op de stadspagina's en in [llms-full.txt](https://hondaanzee.be/llms-full.txt).\n\n` + CITIES.map(city => `- [${city.name}](https://hondaanzee.be/${city.slug}): ${city.description}`).join('\n') + '\n\n' + concise.slice(blogsStart);
const faqStart = concise.indexOf('## Veelgestelde Vragen');
const faqEnd = concise.indexOf('## Overige', faqStart);
if (faqStart < 0 || faqEnd < 0) throw new Error('Missing llms FAQ boundaries');
concise = concise.slice(0, faqStart) + '## Veelgestelde Vragen\n\n' + HOME_FAQ.map(({ q, a }) => `### ${q}\n${a}`).join('\n\n') + '\n\n' + concise.slice(faqEnd);
fs.writeFileSync(concisePath, concise);
