import { HOTSPOTS, OFF_LEASH_AREAS, SERVICES } from '../constants.ts';
import type { City } from '../types.ts';
import { getAnnualBeachRuleText } from './rules.ts';

export interface CityFAQEntry {
  question: string;
  answer: string;
}

const cleanText = (value: string): string => value.replace(/\s+/g, ' ').trim();

const buildServicesBreakdown = (citySlug: string, cityName: string): string => {
  const cityServices = SERVICES.filter(service => service.city === citySlug);
  if (cityServices.length === 0) {
    return 'Op dit moment staan er nog geen praktische diensten op deze pagina.';
  }

  const byType = cityServices.reduce<Record<string, number>>((acc, service) => {
    acc[service.type] = (acc[service.type] ?? 0) + 1;
    return acc;
  }, {});

  const breakdown = Object.entries(byType)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');

  return `Voor ${cityName} tonen we momenteel ${cityServices.length} praktische diensten: ${breakdown}.`;
};

const buildFavoriteSpotAnswer = (city: City): string | null => {
  const cityHotspots = HOTSPOTS.filter(spot => spot.city === city.slug);
  if (cityHotspots.length === 0) {
    return null;
  }

  const recommended = cityHotspots.filter(spot => spot.tags.includes('Aanrader'));
  const pool = recommended.length > 0 ? recommended : cityHotspots;

  const typePriority = ['Restaurant', 'Café', 'Koffiebar', 'Brasserie', 'Slapen'];
  const byPriority = pool
    .slice()
    .sort((a, b) => {
      const aIndex = typePriority.indexOf(a.type);
      const bIndex = typePriority.indexOf(b.type);
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      return safeA - safeB;
    });

  const top = byPriority[0];
  if (!top) {
    return null;
  }

  if (recommended.length > 0) {
    return `Als je iets nieuws wilt proberen in ${city.name}, begin dan bij ${top.name} (${top.type}) - die staat hier als Aanrader.`;
  }

  return `${top.name} (${top.type}) is een sterke eerste keuze in ${city.name} uit de hotspots op deze pagina.`;
};

export const buildCityFAQEntries = (city: City): CityFAQEntry[] => {
  const cityHotspotsCount = HOTSPOTS.filter(spot => spot.city === city.slug).length;
  const cityOffLeashCount = OFF_LEASH_AREAS.filter(area => area.city === city.slug).length;
  const favoriteSpotAnswer = buildFavoriteSpotAnswer(city);

  const entries: CityFAQEntry[] = [
    {
      question: `Welke strandregels gelden voor honden in ${city.name}?`,
      answer: cleanText(getAnnualBeachRuleText(city.rules))
    },
    {
      question: `Hoeveel losloopzones staan er in ${city.name} op HondAanZee?`,
      answer: `In ${city.name} vind je op deze pagina ${cityOffLeashCount} losloopzones of hondenweides.`
    },
    {
      question: `Hoeveel hondvriendelijke hotspots tonen jullie voor ${city.name}?`,
      answer: `Voor ${city.name} tonen we momenteel ${cityHotspotsCount} hondvriendelijke hotspots op deze pagina.`
    },
    {
      question: `Zijn er praktische diensten zoals dierenartsen of dierenspeciaalzaken in ${city.name}?`,
      answer: buildServicesBreakdown(city.slug, city.name)
    }
  ];

  entries.push({
    question: `Welke bronnen gebruiken jullie voor de strandregels in ${city.name}?`,
    answer: `Gecontroleerd op ${city.rules.lastVerifiedAt}. ${(city.rules.sources ?? []).map(source => source.title).join('. ')} Volg de plaatselijke afbakening en tijdelijke maatregelen.`,
  });

  if (favoriteSpotAnswer) {
    entries.push({
      question: `Wat wordt misschien jullie nieuwe favoriete plekje met je viervoeter in ${city.name}?`,
      answer: favoriteSpotAnswer
    });
  }

  return entries;
};

export const buildCityFAQSchema = (city: City): Record<string, unknown> => {
  const entries = buildCityFAQEntries(city);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer
      }
    }))
  };
};