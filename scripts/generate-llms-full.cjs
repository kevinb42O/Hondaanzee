const fs = require('node:fs');
const path = require('node:path');
const { HOTSPOTS, SERVICES, CITIES, blogPosts, EVENTS, OFF_LEASH_AREAS } = require('./place-data.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'llms-full.txt');

let content = `# HondAanZee.be - Volledige Inhoud\n\n`;
content += `> Dit document bevat alle gedetailleerde informatie van HondAanZee.be: alle hondvriendelijke hotspots, diensten, losloopzones, strandregels per gemeente, evenementen en blogartikelen. Dit document is geoptimaliseerd voor LLM's en AI-crawlers om de volledige kennis van de website in één keer te kunnen indexeren.\n\n`;

content += `## Kuststeden en Strandregels\n\n`;
CITIES.forEach(city => {
  content += `### ${city.name}\n`;
  content += `${city.description}\n\n`;
  if (city.rules) {
    if (city.rules.summer) content += `**Zomerregeling:**\n${city.rules.summer.rule}\n\n`;
    if (city.rules.winter) content += `**Winterregeling:**\n${city.rules.winter.rule}\n\n`;
    if (city.rules.special) content += `**Speciale regels:**\n${city.rules.special}\n\n`;
    if (city.rules.note) content += `**Opmerking:**\n${city.rules.note}\n\n`;
  }
});

content += `## Hondvriendelijke Hotspots (Restaurants, Cafés, Hotels)\n\n`;
HOTSPOTS.forEach(spot => {
  content += `### ${spot.name} (${spot.city}, ${spot.type})\n`;
  content += `Adres: ${spot.address}\n`;
  if (spot.description) content += `Beschrijving: ${spot.description}\n`;
  if (spot.recommendationNote) content += `Aanrader omdat: ${spot.recommendationNote}\n`;
  if (spot.tags && spot.tags.length > 0) content += `Kenmerken: ${spot.tags.join(', ')}\n`;
  if (spot.website) content += `Website: ${spot.website}\n`;
  content += `\n`;
});

content += `## Diensten (Dierenartsen, Trimsalons, Winkels)\n\n`;
SERVICES.forEach(service => {
  content += `### ${service.name} (${service.city}, ${service.type})\n`;
  content += `Adres: ${service.address}\n`;
  if (service.description) content += `Beschrijving: ${service.description}\n`;
  if (service.tags && service.tags.length > 0) content += `Kenmerken: ${service.tags.join(', ')}\n`;
  if (service.website) content += `Website: ${service.website}\n`;
  content += `\n`;
});

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
