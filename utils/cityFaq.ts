import { HOTSPOTS, OFF_LEASH_AREAS, SERVICES } from '../constants.ts';
import type { City } from '../types.ts';
import { evaluateCityRuleStatus } from './rules.ts';

export interface CityFAQEntry {
  question: string;
  answer: string;
}

const MONTHS_NL = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december'
];

const cleanText = (value: string): string => value.replace(/\s+/g, ' ').trim();

const formatMmDdToDutch = (mmdd: string): string => {
  const [monthRaw, dayRaw] = mmdd.split('-');
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return mmdd;
  }

  return `${day} ${MONTHS_NL[month - 1]}`;
};

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
  const nowStatus = evaluateCityRuleStatus(city);
  const cityHotspotsCount = HOTSPOTS.filter(spot => spot.city === city.slug).length;
  const cityOffLeashCount = OFF_LEASH_AREAS.filter(area => area.city === city.slug).length;
  const favoriteSpotAnswer = buildFavoriteSpotAnswer(city);

  const entries: CityFAQEntry[] = [
    {
      question: `Wat is de actuele strandstatus voor honden in ${city.name}?`,
      answer: cleanText(`Op dit moment is de status ${nowStatus.status}. ${nowStatus.label}. ${nowStatus.rule}`)
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
      question: `Welke winterregel tonen jullie voor ${city.name}?`,
      answer: cleanText(city.rules.winter.rule)
    },
    {
      question: `Zijn er praktische diensten zoals dierenartsen of dierenspeciaalzaken in ${city.name}?`,
      answer: buildServicesBreakdown(city.slug, city.name)
    }
  ];

  if (city.rules.summer) {
    const timeRange = city.rules.summer.startTime && city.rules.summer.endTime
      ? ` met uurschijf ${city.rules.summer.startTime}-${city.rules.summer.endTime}`
      : '';
    entries.push({
      question: `Wat is de zomerperiode in ${city.name} volgens jullie gegevens?`,
      answer: `Volgens de info op deze pagina loopt de zomerperiode van ${formatMmDdToDutch(city.rules.summer.start)} tot ${formatMmDdToDutch(city.rules.summer.end)}${timeRange}.`
    });
  }

  if (city.rules.special) {
    entries.push({
      question: `Welke extra opmerking geldt voor ${city.name}?`,
      answer: cleanText(city.rules.special)
    });
  }

  if (city.rules.note) {
    entries.push({
      question: `Welke bijkomende nota tonen jullie voor ${city.name}?`,
      answer: cleanText(city.rules.note)
    });
  }

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