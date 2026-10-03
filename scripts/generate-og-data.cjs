/**
 * generate-og-data.cjs
 *
 * Extracts Open Graph metadata for all known routes and writes a lightweight
 * module (`og-routes.js`) at the project root.  The Vercel social
 * proxy imports this file at bundle-time so it can serve the correct
 * OG tags to social-media crawlers without needing a headless browser or
 * the full 160 KB blogs.ts payload.
 *
 * Run as part of the build:
 *   node scripts/generate-og-data.cjs
 */

const fs = require('fs');
const path = require('path');

const SITE = 'https://hondaanzee.be';
const DEFAULT_IMAGE = `${SITE}/og-imagefinal.webp`;
const YEAR = new Date().getFullYear();

// ── helpers ──────────────────────────────────────────────────────────────────

// Use the same typed data inventory as the sitemap and page build.
const { HOTSPOTS, SERVICES, CITIES, blogPosts, EVENTS, OFF_LEASH_AREAS, getAllRoutes, loadTsModule } = require('./place-data.cjs');

const { getEventSEO } = loadTsModule('utils/events.ts');

// ── static page OG metadata ─────────────────────────────────────────────────

const staticPages = {
  '/': {
    title: `Honden aan Zee België ${YEAR} | Strandregels, Losloopzones & Hondvriendelijke Plekken aan de Belgische Kust`,
    description:
      `✓ Actuele strandregels voor honden ✓ Losloopzones en hondenweides ✓ Hondvriendelijke cafés, restaurants & hotels ✓ Alle badsteden van De Panne tot Knokke ✓ Gratis & up-to-date info ${YEAR}`,
    image: DEFAULT_IMAGE,
  },
  '/blog': {
    title: 'Blog | HondAanZee.be — Tips, Natuur & Nieuws over Honden aan de Belgische Kust',
    description:
      'Lees onze blogs over honden aan de Belgische kust: van zeehonden op het strand tot opruimacties. Nuttige info, tips en achtergronden voor elke hondenbezitter.',
    image: DEFAULT_IMAGE,
  },
  '/hotspots': {
    title: 'Hondvriendelijke Hotspots Belgische Kust | Cafés, Restaurants, Hotels & Winkels waar Honden Welkom Zijn',
    description:
      'Ontdek de beste hondvriendelijke cafés, restaurants, hotels en winkels aan de Belgische kust. Van Oostende tot Knokke - waar je hond écht welkom is.',
    image: DEFAULT_IMAGE,
  },
  '/diensten': {
    title: 'Dierenartsen & Dierenwinkels Belgische Kust | Praktische Diensten voor Hondenbezitters',
    description:
      'Vind de beste dierenartsen en dierenwinkels aan de Belgische kust. Van Oostende tot Knokke - alle praktische diensten voor je hond op één plek.',
    image: DEFAULT_IMAGE,
  },
  '/losloopzones': {
    title: 'Losloopzones Belgische Kust | Overzicht Hondenweides & Losloopgebieden aan Zee',
    description:
      'Interactieve kaart met alle losloopzones en hondenweides aan de Belgische kust. Van De Panne tot Knokke.',
    image: DEFAULT_IMAGE,
  },
  '/over-ons': {
    title: 'Over HondAanZee.be | Ons Verhaal & Missie – De Belgische Kust voor Hondenbezitters',
    description:
      'Leer het team achter HondAanZee.be kennen. Onze missie: de meest complete, gratis gids voor hondeneigenaars aan de Belgische kust.',
    image: DEFAULT_IMAGE,
  },
  '/steun-ons': {
    title: 'Steun HondAanZee.be | Help de gids gratis en actueel te houden 🐾',
    description:
      'Heeft HondAanZee je geholpen bij een uitstap met je hond? Steun het onderhoud van strandregels, losloopzones en hondvriendelijke adresjes. Jij kiest het bedrag.',
    image: DEFAULT_IMAGE,
  },
  '/agenda': {
    title: 'Hondvriendelijke Evenementen | Kust, België & Zeeland – HondAanZee.be',
    description:
      'Komende hondenwandelingen, festivals en hondvriendelijke uitstappen aan de kust, in West-Vlaanderen, België en Zeeland. Met praktische informatie en bronnen.',
    image: `${SITE}/events/licht-real.webp`,
  },
  '/kaart': {
    title: 'Interactieve Kaart Belgische Kust | Alle Hondvriendelijke Locaties op de Kaart – HondAanZee.be',
    description:
      'Bekijk alle hondvriendelijke stranden, losloopzones, cafés, restaurants en dierenartsen op onze interactieve kaart.',
    image: DEFAULT_IMAGE,
  },
  '/meldpunt': {
    title: 'Meldpunt Gif & Overlast Belgische Kust | HondAanZee.be',
    description:
      'Meld verdachte stoffen, gif, afval, hondenpoep en andere overlast aan de Belgische kust.',
    image: `${SITE}/properstrand.webp`,
  },
};

// ── build route map ──────────────────────────────────────────────────────────

const routes = { ...staticPages };

for (const post of blogPosts) {
  const ogImage = post.ogImage
    ? `${SITE}${post.ogImage}`
    : post.image
      ? `${SITE}${post.image}`
      : DEFAULT_IMAGE;

  routes[`/blog/${post.slug}`] = {
    title: `${post.title} | HondAanZee.be Blog`,
    description: post.excerpt,
    image: ogImage,
    type: 'article',
    imageAlt: post.imageAlt || post.title,
  };
}

// Every known URL needs its own share preview, including cities and services.
const extraStaticPages = {
  '/goed-om-te-weten': ['Goed om te weten | Honden aan de Belgische kust', 'Praktische informatie over wandelen, gezondheid en veilig op pad gaan met je hond aan de Belgische kust.'],
  '/zaak-aanmelden': ['Zaak aanmelden | HondAanZee.be', 'Meld je hondvriendelijke zaak aan voor vermelding op HondAanZee.be.'],
  '/privacy': ['Privacybeleid | HondAanZee.be', 'Lees hoe HondAanZee.be omgaat met privacy en anonieme bezoekersstatistieken.'],
  '/algemene-voorwaarden': ['Algemene voorwaarden | HondAanZee.be', 'De algemene voorwaarden voor het gebruik van HondAanZee.be.'],
  '/cookies': ['Cookiebeleid | HondAanZee.be', 'Informatie over cookies en bezoekersstatistieken op HondAanZee.be.'],
  '/meldpunt/vrijwilligers': ['Vrijwilligers voor het meldpunt | HondAanZee.be', 'Help mee aan een veilige en schone Belgische kust voor honden en hun baasjes.'],
  '/updates': ['Updates | HondAanZee.be', 'Bekijk de laatste wijzigingen en aanvullingen op HondAanZee.be.'],
};
for (const [route, [title, description]] of Object.entries(extraStaticPages)) {
  routes[route] = { title, description, image: DEFAULT_IMAGE };
}
for (const city of CITIES) {
  routes[`/${city.slug}`] = { title: `Met je hond naar ${city.name} | Strandregels en hondvriendelijke zaken`, description: city.description, image: `${SITE}${city.image}` };
}
for (const [collection, places] of [['hotspots', HOTSPOTS], ['diensten', SERVICES]]) {
  for (const place of places) {
    routes[`/${place.city}/${collection}/${place.slug}`] = { title: `${place.name} | ${place.type} in ${CITIES.find(city => city.slug === place.city).name}`, description: place.summary || place.description, image: `${SITE}${place.images?.[0] || place.image}` };
  }
}
for (const event of EVENTS) {
  const seo = getEventSEO(event);
  routes[`/agenda/${event.slug}`] = { title: seo.title, description: seo.description, image: seo.ogImage, imageAlt: seo.ogImageAlt };
}
for (const area of OFF_LEASH_AREAS) {
  routes[`/losloopzones/${area.slug}`] = { title: `${area.name} | Losloopzones HondAanZee.be`, description: area.description, image: area.images?.[0] || area.image ? `${SITE}${area.images?.[0] || area.image}` : DEFAULT_IMAGE };
}
for (const route of getAllRoutes()) {
  if (!routes[route]) throw new Error(`Missing share metadata: ${route}`);
}

// ── write ────────────────────────────────────────────────────────────────────

const outPath = path.join(__dirname, '..', 'og-routes.js');
const fileContent = `// AUTO-GENERATED BY scripts/generate-og-data.cjs
export default ${JSON.stringify(routes, null, 2)};
`;
fs.writeFileSync(outPath, fileContent, 'utf-8');
console.log(
  `✅  og-routes.js generated — ${Object.keys(routes).length} routes (${blogPosts.length} blog posts)`,
);
