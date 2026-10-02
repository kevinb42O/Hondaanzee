import type { City, Hotspot, Service, OpeningHours } from '../types.ts';
import type { PlaceKind } from './placeRoutes.ts';
import type { SEOProps } from './seo.ts';
import { getPlaceDetailPath } from './placeRoutes.ts';
import { PLACE_PAGE_DATES } from '../data/placePageDates.ts';

type Place = Hotspot | Service;

// Maps Dutch day abbreviations to schema.org day-of-week URIs
const SCHEMA_DAY: Record<string, string> = {
  ma: 'https://schema.org/Monday',
  di: 'https://schema.org/Tuesday',
  wo: 'https://schema.org/Wednesday',
  do: 'https://schema.org/Thursday',
  vr: 'https://schema.org/Friday',
  za: 'https://schema.org/Saturday',
  zo: 'https://schema.org/Sunday',
};

/**
 * Converts the internal OpeningHours map to schema.org OpeningHoursSpecification
 * objects. Closed days (null values) are omitted.
 * Supports single periods ("HH:mm–HH:mm") and comma-separated multiple periods
 * per day ("HH:mm–HH:mm, HH:mm–HH:mm").
 */
const buildOpeningHoursSpecification = (hours: OpeningHours): object[] =>
  Object.entries(hours).flatMap(([day, value]) => {
    if (!value) return [];
    const schemaDay = SCHEMA_DAY[day];
    // Split on comma to support multiple periods per day
    return value.split(',').flatMap((period) => {
      const parts = period.trim().split(/\u2013|–|-/);
      if (parts.length !== 2) return [];
      return [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: schemaDay,
        opens: parts[0].trim(),
        closes: parts[1].trim(),
      }];
    });
  });

const PLACE_SCHEMA_TYPES = {
  hotspot: {
    'Café': 'CafeOrCoffeeShop',
    'Koffiebar': 'CafeOrCoffeeShop',
    'Restaurant': 'Restaurant',
    'Brasserie': 'Restaurant',
    'Slapen': 'LodgingBusiness',
    'Shoppen': 'Store',
  },
  service: {
    'Dierenarts': 'VeterinaryCare',
    'Dierenspeciaalzaak': 'PetStore',
  },
} as const;

const getPlaceCollectionLabel = (kind: PlaceKind) =>
  kind === 'hotspot' ? 'Hotspots' : 'Diensten';

const getPlaceSchemaType = (place: Place, kind: PlaceKind): string =>
  PLACE_SCHEMA_TYPES[kind][place.type as never] || 'LocalBusiness';

const buildPlaceKeywords = (place: Place, city: City, kind: PlaceKind) => {
  const baseTerms = [
    place.name,
    `${place.type} ${city.name}`,
    `${kind === 'hotspot' ? 'hondvriendelijke hotspot' : 'praktische dienst'} ${city.name}`,
    `${place.type.toLowerCase()} belgische kust`,
    `${city.name} hond`,
  ];

  return [
    ...baseTerms,
    ...place.tags.slice(0, 4).map((tag) => `${tag} ${city.name}`),
  ].join(', ');
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

/** Keep the exact business identity; shorten only the descriptive text at a word boundary. */
const buildPlaceDescription = (place: Place, city: City): string => {
  const identity = `${place.name} in ${city.name}.`;
  const text = `${identity} ${normalizeText(place.summary || place.description)}`;
  if (text.length <= 165) return text;
  const prefix = text.slice(0, 164);
  const boundary = prefix.lastIndexOf(' ');
  return `${prefix.slice(0, Math.max(boundary, identity.length)).replace(/[,.!?:;\s]+$/, '')}…`;
};

/** Use the locality as supplied in the actual address, including coastal submunicipalities. */
export const getPlacePostalAddress = (address: string, fallbackCity: string) => {
  const match = normalizeText(address).match(/^(.*),\s*(\d{4})\s+(.+)$/);
  return {
    '@type': 'PostalAddress',
    streetAddress: match ? match[1].trim() : address,
    ...(match ? { postalCode: match[2] } : {}),
    addressLocality: match ? match[3].trim() : fallbackCity,
    addressCountry: 'BE',
  };
};

export const getPlaceSEO = (place: Place, city: City, kind: PlaceKind): SEOProps => {
  const collectionLabel = getPlaceCollectionLabel(kind);
  const route = getPlaceDetailPath(place, kind);
  const canonical = `https://hondaanzee.be${route}`;
  const title = `${place.name} in ${city.name} | HondAanZee.be`;
  const image = place.images?.[0] || place.image;
  const schemaType = getPlaceSchemaType(place, kind);
  const description = buildPlaceDescription(place, city);

  const openingHoursSpec =
    'openingHours' in place && place.openingHours
      ? buildOpeningHoursSpecification(place.openingHours)
      : [];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hondaanzee.be/' },
        { '@type': 'ListItem', position: 2, name: city.name, item: `https://hondaanzee.be/${city.slug}` },
        { '@type': 'ListItem', position: 3, name: collectionLabel, item: `https://hondaanzee.be/${kind === 'hotspot' ? 'hotspots' : 'diensten'}` },
        { '@type': 'ListItem', position: 4, name: place.name, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: 'nl-BE',
      isPartOf: { '@type': 'WebSite', '@id': 'https://hondaanzee.be/#website', name: 'HondAanZee.be', url: 'https://hondaanzee.be/' },
      publisher: { '@type': 'Organization', '@id': 'https://hondaanzee.be/#organization', name: 'HondAanZee.be', url: 'https://hondaanzee.be/' },
      mainEntity: { '@id': `${canonical}#business` },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
      ...(PLACE_PAGE_DATES[route] ? { dateModified: PLACE_PAGE_DATES[route] } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': schemaType,
      '@id': `${canonical}#business`,
      name: place.name,
      description: normalizeText(place.description),
      url: canonical,
      image: [`https://hondaanzee.be${image}`],
      telephone: place.phone,
      mainEntityOfPage: { '@id': `${canonical}#webpage` },
      address: getPlacePostalAddress(place.address, city.name),
      ...((place.website || place.sameAs?.length) ? { sameAs: [...new Set([...(place.sameAs || []), ...(place.website ? [place.website] : [])])] } : {}),
      ...(openingHoursSpec.length > 0 ? { openingHoursSpecification: openingHoursSpec } : {}),
    },
  ];

  return {
    title,
    description,
    keywords: buildPlaceKeywords(place, city, kind),
    canonical,
    ogImage: `https://hondaanzee.be${image}`,
    ogImageAlt: `${place.name} in ${city.name}`,
    structuredData,
  };
};
