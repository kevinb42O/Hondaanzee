import { HOME_FAQ_SCHEMA } from '../data/homeFaq.ts';
import { useContext, useEffect } from 'react';
import { StaticSEOContext } from './staticSEO';
import { useLocation } from 'react-router-dom';
import type { City, OffLeashArea, ReportItem } from '../types.ts';
import { getCategoryMeta } from './reportHelpers.ts';
import { getReportDetailPath } from './reportRoutes.ts';
import { PAGE_UPDATED_DATES, SITE_UPDATE_DATE } from '../data/siteUpdates.ts';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  canonical?: string;
  structuredData?: object | object[];
  /** When true, page is excluded from search index (e.g. filtered list combos). */
  noindex?: boolean;
  /** ISO date used for article:published_time when ogType='article'. */
  articlePublishedTime?: string;
  /** ISO date used for article:modified_time when ogType='article'. */
  articleModifiedTime?: string;
  /** Optional list of section/category names for article:section. */
  articleSection?: string;
  /** Optional author name for article:author. */
  articleAuthor?: string;
}

const SITE_ORIGIN = 'https://hondaanzee.be';
const TWITTER_HANDLE = '@hondaanzee';

export const useSEO = ({
  title,
  description,
  keywords,
  ogImage = `${SITE_ORIGIN}/og-imagefinal.webp`,
  ogImageAlt,
  ogType = 'website',
  canonical,
  structuredData,
  noindex = false,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleAuthor,
}: SEOProps) => {
  const location = useLocation();
  const collectStaticSEO = useContext(StaticSEOContext);
  const resolvedCanonical = canonical || `${SITE_ORIGIN}${location.pathname}`;
  const pageModifiedDate = PAGE_UPDATED_DATES[location.pathname];
  const schemas = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];
  const hasPageSchema = schemas.some(schema => (schema as { '@type'?: string })['@type'] === 'WebPage');
  const resolvedStructuredData = pageModifiedDate && !hasPageSchema ? [...schemas, {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${resolvedCanonical}#webpage`,
    url: resolvedCanonical,
    name: title,
    dateModified: pageModifiedDate,
  }] : structuredData;
  // The initial HTML and browser must expose the same modification dates.
  collectStaticSEO?.({ title, description, keywords, ogImage, ogImageAlt, ogType, canonical: resolvedCanonical, structuredData: resolvedStructuredData, noindex, articlePublishedTime, articleModifiedTime, articleSection, articleAuthor });

  useEffect(() => {
    // Ensure html lang is set (also covered statically in index.html, but
    // re-asserting prevents 3rd-party scripts from clobbering it).
    if (document.documentElement.lang !== 'nl-BE') {
      document.documentElement.lang = 'nl-BE';
    }

    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const removeMeta = (name: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      const element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (element) element.remove();
    };

    // Basic meta tags
    updateMeta('title', title);
    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);

    // Robots — granular control for filter permutations / private routes
    updateMeta(
      'robots',
      noindex
        ? 'noindex, follow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    );

    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:image:url', ogImage, true);
    updateMeta('og:image:secure_url', ogImage, true);
    // Custom event images have different aspect ratios. Do not declare invented dimensions.
    document.querySelector('meta[property="og:image:width"]')?.remove();
    document.querySelector('meta[property="og:image:height"]')?.remove();
    updateMeta(
      'og:image:type',
      ogImage.endsWith('.png') ? 'image/png' : ogImage.endsWith('.jpg') || ogImage.endsWith('.jpeg') ? 'image/jpeg' : 'image/webp',
      true,
    );
    updateMeta('og:image:alt', ogImageAlt || title, true);
    updateMeta('og:url', resolvedCanonical, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:site_name', 'HondAanZee.be', true);
    updateMeta('og:locale', 'nl_BE', true);

    // Article-specific tags (only meaningful when ogType='article')
    if (ogType === 'article') {
      if (articlePublishedTime) updateMeta('article:published_time', articlePublishedTime, true);
      if (articleModifiedTime) updateMeta('article:modified_time', articleModifiedTime, true);
      if (articleSection) updateMeta('article:section', articleSection, true);
      updateMeta('article:author', articleAuthor || 'HondAanZee.be', true);
    } else {
      removeMeta('article:published_time', true);
      removeMeta('article:modified_time', true);
      removeMeta('article:section', true);
      removeMeta('article:author', true);
    }

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', TWITTER_HANDLE);
    updateMeta('twitter:creator', TWITTER_HANDLE);
    updateMeta('twitter:url', resolvedCanonical);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    updateMeta('twitter:image:alt', ogImageAlt || title);

    // Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', resolvedCanonical);
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
      link.setAttribute('href', resolvedCanonical);
    });

    // Structured Data
    if (resolvedStructuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        (script as HTMLElement).dataset.dynamic = 'true';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(resolvedStructuredData);
    }

    // Cleanup: remove dynamic structured data so stale schemas don't persist
    return () => {
      const dynamicScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (dynamicScript) dynamicScript.remove();
    };
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogImageAlt,
    ogType,
    canonical,
    structuredData,
    noindex,
    articlePublishedTime,
    articleModifiedTime,
    articleSection,
    articleAuthor,
    location,
  ]);
};

export { getPlaceSEO } from './placeSEO.ts';

export const getOffLeashAreaSEO = (area: OffLeashArea, cityName: string): SEOProps => {
  const canonical = `https://hondaanzee.be/losloopzones/${area.slug}`;
  const description = `${area.name} in ${cityName}. ${area.description}`.replace(/\s+/g, ' ').trim().slice(0, 158);
  const image = area.images?.[0] || area.image || '/offleash.webp';

  return {
    title: `${area.name} | Losloopzone in ${cityName} | HondAanZee.be`,
    description,
    canonical,
    ogImage: image.startsWith('https://')?image:`https://hondaanzee.be${image}`,
    keywords: `${area.name}, losloopzone ${cityName.toLowerCase()}, hondenweide ${cityName.toLowerCase()}, losloopgebied belgische kust`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hondaanzee.be/' },
          { '@type': 'ListItem', position: 2, name: 'Losloopzones', item: 'https://hondaanzee.be/losloopzones' },
          { '@type': 'ListItem', position: 3, name: area.name, item: canonical },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Park',
        name: area.name,
        description,
        url: canonical,
        image: [image.startsWith('https://')?image:`https://hondaanzee.be${image}`],
        address: {
          '@type': 'PostalAddress',
          streetAddress: area.address,
          addressLocality: cityName,
          addressCountry: 'BE',
        },
      },
    ],
  };
};

export const getReportSEO = (report: ReportItem): SEOProps => {
  const category = getCategoryMeta(report.category).label;
  const canonical = `https://hondaanzee.be${getReportDetailPath(report.public_id)}`;
  const description = `${category} gemeld in ${report.city_name}. ${report.location_text}. ${report.description}`.replace(/\s+/g, ' ').trim().slice(0, 158);

  return {
    title: `${category} in ${report.city_name} | Meldpunt | HondAanZee.be`,
    description,
    canonical,
    ogImage: 'https://hondaanzee.be/properstrand.webp',
    keywords: `${category}, meldpunt ${report.city_name.toLowerCase()}, verdachte stof melden ${report.city_name.toLowerCase()}, overlast melding belgische kust`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hondaanzee.be/' },
          { '@type': 'ListItem', position: 2, name: 'Meldpunt', item: 'https://hondaanzee.be/meldpunt' },
          { '@type': 'ListItem', position: 3, name: report.location_text, item: canonical },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Report',
        name: `${category} in ${report.city_name}`,
        description,
        url: canonical,
      },
    ],
  };
};

const YEAR = new Date().getFullYear();

// SEO Metadata for each page type
export const SEO_DATA = {
  home: {
    title: `Honden aan Zee België ${YEAR} | Strandregels, Losloopzones & Hondvriendelijke Plekken aan de Belgische Kust`,
    description: `✓ Actuele strandregels voor honden ✓ Losloopzones en hondenweides ✓ Hondvriendelijke cafés, restaurants & hotels ✓ Alle badsteden van De Panne tot Knokke ✓ Gratis & up-to-date info ${YEAR}`,
    keywords: `hond strand belgië, hond aan zee, hondenstrand belgië, losloopzone hond kust, hondvriendelijk strand, strand met hond belgie, wandelen hond zee, hondvriendelijk restaurant kust, strandregels honden ${YEAR}`,
    structuredData: HOME_FAQ_SCHEMA,
  },

  hotspots: {
    title: 'Hondvriendelijke Hotspots Belgische Kust | Cafés, Restaurants, Hotels & Winkels waar Honden Welkom Zijn',
    description: 'Ontdek de beste hondvriendelijke cafés, restaurants, hotels en winkels aan de Belgische kust. Van Oostende tot Knokke - waar je hond écht welkom is. Filter op stad en type.',
    keywords: 'hondvriendelijk restaurant belgië kust, hondvriendelijk café aan zee, hotel honden toegelaten kust, hondvriendelijk terras zee, hond welkom restaurant, hond toegestaan café, hondvriendelijke horeca kust, hondvriendelijke winkel kust, skateshop hondvriendelijk blankenberge, winkelen met hond aan zee, hondenaccesoires kust, skateshop daily grind blankenberge',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Hotspots", "item": "https://hondaanzee.be/hotspots" }
      ]
    }
  },

  diensten: {
    title: 'Dierenartsen & Dierenwinkels Belgische Kust | Praktische Diensten voor Hondenbezitters',
    description: 'Vind de beste dierenartsen en dierenwinkels aan de Belgische kust. Van Oostende tot Knokke - alle praktische diensten voor je hond op één plek. Filter op stad en type.',
    keywords: 'dierenarts aan zee belgië, dierenwinkel kust belgië, dierenspeciaalzaak strand, dierenarts oostende, petshop aan zee, hondentrimsalon kust, dierenarts knokke, dierenwinkel blankenberge',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Diensten", "item": "https://hondaanzee.be/diensten" }
      ]
    }
  },

  losloopzones: {
    title: 'Losloopzones Belgische Kust | Overzicht Hondenweides & Losloopgebieden aan Zee',
    description: 'Interactieve kaart met alle losloopzones en hondenweides aan de Belgische kust. Van De Panne tot Knokke - vind de perfecte plek waar je hond vrij kan loslopen. Met ratings, foto\'s en routebeschrijvingen.',
    keywords: 'losloopzone hond kust belgië, hondenweide aan zee, hondenlosloopgebied strand, vrij loslopen hond zee, omheinde hondenweide kust, losloopzone oostende, hondenweide knokke, losloopgebied de haan',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Losloopzones", "item": "https://hondaanzee.be/losloopzones" }
      ]
    }
  },

  privacy: {
    title: 'Privacybeleid | HondAanZee.be',
    description: 'Privacybeleid van HondAanZee.be - Hoe wij omgaan met je gegevens volgens AVG/GDPR',
    keywords: ''
  },

  terms: {
    title: 'Algemene Voorwaarden | HondAanZee.be',
    description: 'Algemene voorwaarden voor het gebruik van HondAanZee.be',
    keywords: ''
  },

  cookies: {
    title: 'Cookiebeleid | HondAanZee.be',
    description: 'Cookiebeleid van HondAanZee.be - Welke cookies we gebruiken en waarom',
    keywords: ''
  },

  agenda: {
    title: 'Hondvriendelijke Evenementen | Kust, West-Vlaanderen, België & Zeeland – HondAanZee.be',
    description: 'Plan een uitstap met je hond: komende wandelingen, festivals en hondvriendelijke evenementen aan de kust, in West-Vlaanderen, België en Zeeland. Met praktische info en bronnen.',
    keywords: 'hondenevenement, hondenwandeling, hondenfestival, agenda honden, Belgische kust, West-Vlaanderen, Zeeland, hondvriendelijke evenementen',
    canonical: 'https://hondaanzee.be/agenda',
    ogImage: 'https://hondaanzee.be/events/licht-real.webp',
    ogImageAlt: 'Lichtgolf Oostende, foto van de editie 2025 door Nick Decombel Fotografie',
  },

  about: {
    title: 'Kevin & Jax | Het verhaal achter HondAanZee.be',
    description: 'Maak kennis met Kevin, software developer, technologist en kustbewoner, en zijn hond Jax. Samen de inspiratie achter de gratis kustgids HondAanZee.be.',
    keywords: 'over hondaanzee, Kevin en Jax, software developer, technologist, hondvriendelijke Belgische kust',
    canonical: 'https://hondaanzee.be/over-ons',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Over ons", "item": "https://hondaanzee.be/over-ons" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Over HondAanZee.be",
        "url": "https://hondaanzee.be/over-ons",
        "description": "Het verhaal van Kevin, software developer en technologist, en zijn hond Jax achter de kustgids HondAanZee.be.",
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be"
        }
      }
    ]
  },

  kaart: {
    title: 'Interactieve Kaart Belgische Kust | Alle Hondvriendelijke Locaties op de Kaart – HondAanZee.be',
    description: 'Bekijk alle hondvriendelijke stranden, losloopzones, cafés, restaurants en dierenartsen op onze interactieve kaart van de Belgische kust. Van De Panne tot Knokke.',
    keywords: 'kaart hondvriendelijk strand belgie, interactieve kaart belgische kust hond, hondenstrand kaart, losloopzone kaart kust',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Kaart", "item": "https://hondaanzee.be/kaart" }
      ]
    }
  },

  steunOns: {
    title: 'Steun HondAanZee.be | Help de gids gratis en actueel te houden 🐾',
    description: 'Heeft HondAanZee je geholpen bij een uitstap met je hond? Steun het onderhoud van strandregels, losloopzones en hondvriendelijke adresjes. Jij kiest het bedrag.',
    keywords: 'steun hondaanzee, donatie hondaanzee, hondaanzee ondersteunen',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Steun ons", "item": "https://hondaanzee.be/steun-ons" }
      ]
    }
  },

  meldpunt: {
    title: 'Meldpunt Gif & Overlast Belgische Kust | HondAanZee.be',
    description: 'Meld verdachte stoffen, gif, afval, hondenpoep en andere overlast aan de Belgische kust. Publieke meldingen per kuststad, direct zichtbaar op HondAanZee.be.',
    keywords: 'meldpunt gif kust, verdachte stof melden oostende, afval melden strand belgie, overlast melden kust, meldpunt belgische kust',
    canonical: 'https://hondaanzee.be/meldpunt',
    ogImage: 'https://hondaanzee.be/properstrand.webp',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hondaanzee.be/' },
          { '@type': 'ListItem', position: 2, name: 'Meldpunt', item: 'https://hondaanzee.be/meldpunt' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Meldpunt Gif & Overlast',
        url: 'https://hondaanzee.be/meldpunt',
        description: 'Publieke meldpagina voor verdachte stoffen, afval en overlast aan de Belgische kust.',
      },
    ],
  },

  blog: {
    title: 'Blog | HondAanZee.be — Tips, Natuur & Nieuws over Honden aan de Belgische Kust',
    description: 'Lees onze blogs over honden aan de Belgische kust: van zeehonden op het strand tot opruimacties. Nuttige info, tips en achtergronden voor elke hondenbezitter.',
    keywords: 'blog hondaanzee, zeehonden belgische kust hond, opruimacties strand, proper strand lopers, hond aan zee blog, natuur belgische kust, strand opruimen hond',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://hondaanzee.be/blog" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "HondAanZee Blog",
        "url": "https://hondaanzee.be/blog",
        "description": "Blog over honden aan de Belgische kust: natuur, veiligheid en duurzaamheid",
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be"
        }
      }
    ]
  }
};

// City-specific LocalBusiness structured data for notable hotspots
const CITY_LOCAL_BUSINESSES: Record<string, object[]> = {
  blankenberge: [
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Skateshop Daily Grind",
      "description": "Hondvriendelijke skateshop in Blankenberge met unieke hondenaccessoires van authentieke skatemerken. Honden zijn van harte welkom.",
      "url": "https://daily-grind-skateshop.webshopapp.com/",
      "image": "https://hondaanzee.be/dailygrind2.webp",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Langestraat 1",
        "addressLocality": "Blankenberge",
        "postalCode": "8370",
        "addressCountry": "BE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "addressCountry": "BE"
      },
      "keywords": "skateshop, hondvriendelijk, hondenaccessoires, skatemerk, leiband, drinkbak hond, Blankenberge",
      "sameAs": ["https://daily-grind-skateshop.webshopapp.com/"]
    }
  ]
};

// Generate city-specific SEO data
export const getCitySEO = (cityName: string, citySlug: string) => {
  const searchTerms = [
    `hond strand ${cityName.toLowerCase()}`,
    `hondenstrand ${cityName.toLowerCase()}`,
    `losloopzone ${cityName.toLowerCase()}`,
    `strandregels hond ${cityName.toLowerCase()}`,
    `hond toegestaan strand ${cityName.toLowerCase()}`,
    `wandelen hond ${cityName.toLowerCase()}`,
    `hondenweide ${cityName.toLowerCase()}`,
    `hondvriendelijk ${cityName.toLowerCase()}`
  ];

  // Add city-specific extra keywords
  const cityExtraKeywords: Record<string, string> = {
    blankenberge: ', skateshop blankenberge hond, daily grind blankenberge, hondvriendelijke winkel blankenberge, winkelen met hond blankenberge, hondenaccessoires blankenberge'
  };

  const cityLocalBusinesses = CITY_LOCAL_BUSINESSES[citySlug] || [];

  return {
    title: `Hond Strand ${cityName} ${YEAR} | Strandregels, Losloopzones & Hondvriendelijke Plekken ${cityName}`,
    description: `✓ Actuele strandregels voor honden in ${cityName} ✓ Losloopzones en hondenweides ✓ Waar mag je hond vrij lopen? ✓ Seizoensregels winter & zomer ✓ Hondvriendelijke cafés en restaurants in ${cityName}`,
    keywords: searchTerms.join(', ') + (cityExtraKeywords[citySlug] || ''),
    canonical: `https://hondaanzee.be/${citySlug}`,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": cityName, "item": `https://hondaanzee.be/${citySlug}` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
      "name": `${cityName} - Hondvriendelijk Strand`,
      "description": `Informatie over strandregels en faciliteiten voor honden in ${cityName} aan de Belgische kust`,
      "url": `https://hondaanzee.be/${citySlug}`,
      "isAccessibleForFree": true,
      "publicAccess": true,
      "geo": {
        "@type": "GeoCoordinates",
        "addressCountry": "BE"
      },
      "touristType": ["Pet Owner", "Dog Owner"],
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Hondvriendelijk strand",
          "value": true
        }
      ]
    },
      ...cityLocalBusinesses
    ]
  };
};
