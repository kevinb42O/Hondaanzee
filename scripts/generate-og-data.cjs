/**
 * generate-og-data.cjs
 *
 * Extracts Open Graph metadata for all known routes and writes a lightweight
 * JSON file (`og-routes.json`) at the project root.  The Vercel Edge
 * Middleware imports this file at bundle-time so it can serve the correct
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

/** Cheap extraction of the blogPosts array from data/blogs.ts. */
function extractBlogPosts() {
  const raw = fs.readFileSync(
    path.join(__dirname, '..', 'data', 'blogs.ts'),
    'utf-8',
  );

  // Grab every top-level post object from the exported array.
  // We only need slug, title, excerpt, image, ogImage and imageAlt.
  const posts = [];
  const slugRe = /slug:\s*'([^']+)'/g;
  let m;
  while ((m = slugRe.exec(raw)) !== null) {
    const idx = m.index;

    // Walk backwards to find the opening brace of this object literal.
    let bracePos = raw.lastIndexOf('{', idx);

    // Walk forward from the brace to the matching closing brace.
    let depth = 0;
    let end = bracePos;
    for (let i = bracePos; i < raw.length; i++) {
      if (raw[i] === '{') depth++;
      if (raw[i] === '}') depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }

    const block = raw.slice(bracePos, end);

    const get = (key) => {
      const re = new RegExp(`(?:^|\\n)\\s*${key}:\\s*'([^']*)'`);
      const hit = re.exec(block);
      return hit ? hit[1] : undefined;
    };

    // Only top-level post objects have slug + title + excerpt
    const slug = get('slug');
    const title = get('title');
    const excerpt = get('excerpt');

    if (!slug || !title || !excerpt) continue;

    posts.push({
      slug,
      title,
      excerpt,
      image: get('image'),
      ogImage: get('ogImage'),
      imageAlt: get('imageAlt'),
    });
  }

  return posts;
}

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
    title: 'Steun HondAanZee.be | Trakteer ons op een Hondenkoekje 🐾',
    description:
      'HondAanZee.be is 100% gratis. Steun ons werk en help ons de leukste plekken aan de Belgische kust te blijven delen voor hondenbezitters.',
    image: DEFAULT_IMAGE,
  },
  '/agenda': {
    title: `Hondvriendelijke Evenementen Belgische Kust ${YEAR} | Agenda & Events – HondAanZee.be`,
    description:
      `Ontdek alle hondvriendelijke evenementen aan de Belgische kust in ${YEAR}: festivals, wandelingen en meer.`,
    image: `${SITE}/kwispelfestival.webp`,
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

const blogPosts = extractBlogPosts();
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

// ── write ────────────────────────────────────────────────────────────────────

const outPath = path.join(__dirname, '..', 'og-routes.js');
const fileContent = `// AUTO-GENERATED BY scripts/generate-og-data.cjs
export default ${JSON.stringify(routes, null, 2)};
`;
fs.writeFileSync(outPath, fileContent, 'utf-8');
console.log(
  `✅  og-routes.js generated — ${Object.keys(routes).length} routes (${blogPosts.length} blog posts)`,
);
