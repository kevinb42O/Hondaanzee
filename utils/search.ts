import { CITIES } from '../cityData.ts';
import { HOTSPOTS, SERVICES, OFF_LEASH_AREAS } from '../constants.ts';
import { getHotspotDetailPath, getServiceDetailPath } from './placeRoutes.ts';
import { getOffLeashAreaPath } from './offLeashRoutes.ts';

export type SearchKind = 'city' | 'hotspot' | 'service' | 'off-leash';

export interface SearchResult {
  id: string;
  kind: SearchKind;
  name: string;
  label: string;
  cityName: string;
  path: string;
  image?: string;
  description: string;
  approximate: boolean;
}

export const normalizeSearch = (value: string): string => value
  .toLocaleLowerCase('nl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const STOP_WORDS = new Set(['de', 'het', 'een', 'la', 'le', 't', 'in', 'te', 'van', 'aan', 'en', 'met', 'je', 'voor', 'op', 'bij']);
const words = (value: string) => normalizeSearch(value).split(' ').filter(word => word && !STOP_WORDS.has(word));
const meaningfulName = (value: string) => words(value).join(' ');
const CATEGORY_TERMS: Record<string, string[]> = {
  Restaurant: ['restaurant', 'restaurants', 'eten', 'eetgelegenheid'],
  Brasserie: ['brasserie', 'brasseries', 'restaurant', 'restaurants', 'eten', 'eetgelegenheid'],
  Café: ['cafe', 'cafes', 'bar', 'drinken'],
  Koffiebar: ['koffiebar', 'koffiebars', 'koffie', 'coffee', 'cafe'],
  Slapen: ['slapen', 'overnachten', 'overnachting', 'accommodatie', 'logeren', 'verblijf'],
  Shoppen: ['shoppen', 'winkel', 'winkels'],
  Dierenarts: ['dierenarts', 'dierenartsen', 'dierenkliniek', 'dierenartsenpraktijk', 'veterinair'],
  Dierenspeciaalzaak: ['dierenspeciaalzaak', 'dierenwinkel', 'dierenwinkels', 'hondenwinkel', 'shoppen', 'winkel'],
};
const ALIASES: Record<string, string[]> = {
  'brasserie-la-potiniere': ['de potiniere', 'la potiniere', 'potiniere'],
  'knokke-heist': ['knokke', 'heist'],
};

interface SearchDocument {
  result: Omit<SearchResult, 'approximate'>;
  names: string[];
  nameWords: string[];
  categoryWords: string[];
  cityWords: string[];
  extraWords: string[];
}

const cityNames = new Map(CITIES.map(city => [city.slug, city.name]));
const knownCityWords = new Set(CITIES.flatMap(city => words(city.name)));
const createDocument = (
  result: Omit<SearchResult, 'approximate'>,
  slug: string,
  categories: string[],
  extras: string[] = [],
): SearchDocument => {
  const names = [result.name, ...(ALIASES[slug] || [])].map(meaningfulName);
  return {
    result,
    names,
    nameWords: [...new Set(names.flatMap(words))],
    categoryWords: categories.flatMap(words),
    cityWords: words(result.cityName),
    extraWords: extras.flatMap(words),
  };
};

// Build once from the canonical catalogs. Home loads this module on search interaction.
const DOCUMENTS: SearchDocument[] = [
  ...CITIES.map(city => createDocument({
    id: `city:${city.slug}`, kind: 'city', name: city.name, label: 'Badstad', cityName: city.name,
    path: `/${city.slug}`, image: city.image, description: city.description,
  }, city.slug, ['badstad', 'badsteden', 'kuststad', 'strand', 'strandregels'], ALIASES[city.slug])),
  ...HOTSPOTS.map(place => createDocument({
    id: `hotspot:${place.slug}`, kind: 'hotspot', name: place.name, label: place.type,
    cityName: cityNames.get(place.city) || place.city, path: getHotspotDetailPath(place),
    image: place.image, description: place.summary || place.description,
  }, place.slug, CATEGORY_TERMS[place.type] || [place.type], [...place.tags, place.address])),
  ...SERVICES.map(place => createDocument({
    id: `service:${place.slug}`, kind: 'service', name: place.name, label: place.type,
    cityName: cityNames.get(place.city) || place.city, path: getServiceDetailPath(place),
    image: place.image, description: place.summary || place.description,
  }, place.slug, CATEGORY_TERMS[place.type] || [place.type], [...place.tags, place.address])),
  ...OFF_LEASH_AREAS.map(area => createDocument({
    id: `off-leash:${area.slug}`, kind: 'off-leash', name: area.name, label: 'Losloopzone',
    cityName: cityNames.get(area.city) || area.city, path: getOffLeashAreaPath(area.slug),
    image: area.image || area.images?.[0], description: area.description,
  }, area.slug, ['losloopzone', 'losloopzones', 'losloopweide', 'losloopweides', 'hondenweide'], [area.address])),
];

// Adjacent transpositions count as one typo; short words require an exact/prefix match.
const editDistance = (a: string, b: string): number => {
  const rows = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[a.length][b.length];
};

const tokenScore = (token: string, candidates: string[], weight: number, fuzzy: boolean): { score: number; approximate: boolean } => {
  if (candidates.includes(token)) return { score: weight, approximate: false };
  if (token.length >= 2 && candidates.some(word => word.startsWith(token))) return { score: weight * 0.8, approximate: false };
  const maxDistance = token.length >= 8 ? 2 : 1;
  if (fuzzy && token.length >= 4 && candidates.some(word => word.length >= 4 && Math.abs(word.length - token.length) <= maxDistance && editDistance(token, word) <= maxDistance)) {
    return { score: weight * 0.35, approximate: true };
  }
  return { score: 0, approximate: false };
};

export function searchSite(query: string): SearchResult[] {
  const tokens = words(query);
  if (!tokens.length) return [];
  const phrase = tokens.join(' ');
  const cityTokens = tokens.filter(token => knownCityWords.has(token));
  const scored = DOCUMENTS.flatMap(document => {
    // An explicitly named municipality is a constraint. In particular, do not
    // approximate "Oostende" to "Westende" in a category-and-city query.
    if (!cityTokens.every(token => document.cityWords.includes(token))) return [];
    let score = 0;
    let approximate = false;
    for (const token of tokens) {
      const matches = [
        tokenScore(token, document.nameWords, 100, true),
        tokenScore(token, document.categoryWords, 55, true),
        tokenScore(token, document.cityWords, 45, true),
        tokenScore(token, document.extraWords, 15, false),
      ];
      // Always prefer literal matches to fuzzy ones, even in lower-weight fields.
      const exact = matches.filter(match => !match.approximate && match.score > 0);
      const best = (exact.length ? exact : matches).sort((a, b) => b.score - a.score)[0];
      if (!best.score) return [];
      score += best.score;
      approximate ||= best.approximate;
    }
    if (document.names.includes(phrase)) score += 1000;
    else if (document.names.some(name => name.startsWith(phrase))) score += 300;
    else if (document.names.some(name => name.includes(phrase))) score += 200;
    return [{ result: { ...document.result, approximate }, score }];
  });
  return scored.sort((a, b) => Number(a.result.approximate) - Number(b.result.approximate) || b.score - a.score || a.result.name.localeCompare(b.result.name, 'nl')).map(match => match.result);
}
