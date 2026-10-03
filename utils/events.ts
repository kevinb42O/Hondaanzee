import type { DogEvent, EventRegion } from '../data/events.ts';

const SITE = 'https://hondaanzee.be';
const belgianDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
});

export const EVENT_REGION_LABELS: Record<EventRegion, string> = {
  kust: 'Belgische kust',
  'west-vlaanderen': 'West-Vlaanderen',
  belgie: 'Verder in België',
  zeeland: 'Zeeland',
};

export function getBelgianEventDate(now: Date = new Date()): string {
  const parts = belgianDate.formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getEventEndDate(event: DogEvent): string {
  return event.endDate || event.schemaEndDate?.slice(0, 10) || event.date;
}

export function isEventPast(event: DogEvent, now: Date = new Date()): boolean {
  // A known closing time takes precedence. Date-only announcements remain
  // visible through their final Belgian calendar day; no midnight is invented.
  if (event.schemaEndDate?.includes('T')) {
    const end = Date.parse(event.schemaEndDate);
    if (Number.isFinite(end)) return now.getTime() >= end;
  }
  return getEventEndDate(event) < getBelgianEventDate(now);
}

export function getEventCountdown(event: DogEvent, now: Date = new Date()): string {
  if (isEventPast(event, now)) return 'Afgelopen';
  const today = getBelgianEventDate(now);
  if (event.date < today) return 'Nu bezig';
  const days = Math.round((Date.parse(event.date) - Date.parse(today)) / 86_400_000);
  if (days === 0) return 'Vandaag';
  if (days === 1) return 'Morgen';
  return `Nog ${days} dagen`;
}

export function getUpcomingEvents(events: DogEvent[], now: Date = new Date()): DogEvent[] {
  return events.filter(event => !isEventPast(event, now)).sort((a, b) => a.date.localeCompare(b.date));
}

export function absoluteEventImage(event: DogEvent): string | undefined {
  if (!event.image) return undefined;
  return event.image.startsWith('/') ? `${SITE}${event.image}` : event.image;
}

export function getEventStructuredData(event: DogEvent, now: Date = new Date()) {
  const url = `${SITE}/agenda/${event.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${url}#event`,
    name: event.title,
    description: event.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}#webpage` },
    startDate: event.schemaStartDate,
    endDate: event.schemaEndDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        ...(event.structuredAddress || {}),
        addressLocality: event.structuredAddress?.addressLocality || event.cityName,
        addressCountry: event.country || 'BE',
      },
    },
    image: absoluteEventImage(event),
    url,
    isAccessibleForFree: event.isAccessibleForFree,
    // Publish an offer only for a confirmed price and a real booking page.
    // A generic organizer page, unknown fees or expired edition is not an offer.
    ...(event.entryPrice !== undefined && event.ticketUrl && !isEventPast(event, now) ? {
      offers: {
        '@type': 'Offer', price: event.entryPrice, priceCurrency: 'EUR',
        url: event.ticketUrl,
      },
    } : {}),
    ...(event.organizerName ? {
      organizer: {
        '@type': 'Organization', name: event.organizerName,
        url: event.organizerUrl || event.website,
      },
    } : {}),
  };
}

export function getAgendaStructuredData(events: DogEvent[], now: Date = new Date()) {
  const upcoming = getUpcomingEvents(events, now);
  return [
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      '@id': `${SITE}/agenda#webpage`,
      mainEntity: { '@id': `${SITE}/agenda#evenementen` },
      isPartOf: { '@id': `${SITE}/#website` },
      name: 'Hondvriendelijke evenementen aan de kust en daarbuiten',
      description: 'Komende hondenwandelingen, festivals en uitstappen aan de Belgische kust, in West-Vlaanderen en verder weg.',
      url: `${SITE}/agenda`, inLanguage: 'nl-BE',
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList',
      '@id': `${SITE}/agenda#evenementen`,
      numberOfItems: upcoming.length,
      itemListElement: upcoming.map((event, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: { '@type': 'WebPage', '@id': `${SITE}/agenda/${event.slug}#webpage`, url: `${SITE}/agenda/${event.slug}`, name: event.title },
      })),
    },
  ];
}

/** Use the edition's year, even when an archived page is viewed years later. */
export function getEventSEO(event: DogEvent, now: Date = new Date()) {
  const url = `${SITE}/agenda/${event.slug}`;
  const firstYear = event.date.slice(0, 4);
  const lastYear = getEventEndDate(event).slice(0, 4);
  const years = firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`;
  const place = event.title.toLocaleLowerCase('nl-BE').includes(event.cityName.toLocaleLowerCase('nl-BE')) ? '' : ` in ${event.cityName}`;
  const edition = event.title.includes(years) ? '' : ` ${years}`;
  const title = `${event.title}${edition}${place} | HondAanZee.be`;
  const archive = isEventPast(event, now);
  const intro = `${archive ? 'Voorbije editie: ' : ''}${event.title}, ${event.dateDisplay} in ${event.cityName}.`;
  const description = `${intro} ${archive ? 'Informatie over deze voorbije editie en de locatie.' : event.status === 'save-the-date' ? 'Datum aangekondigd; praktische details volgen.' : 'Bekijk het programma, de locatie, prijs en hondenvoorwaarden.'}`.replace(/\s+/g, ' ').replace(/\.\./g, '.').trim();
  return {
    title, description,
    canonical: url,
    ogImage: absoluteEventImage(event) || `${SITE}/og-imagefinal.webp`,
    ogImageAlt: event.image ? event.imageAlt || event.title : 'HondAanZee.be — gids voor honden aan de Belgische kust',
    structuredData: [
      {
        '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${url}#webpage`,
        url, name: title, description, inLanguage: 'nl-BE',
        isPartOf: { '@id': `${SITE}/#website` },
        publisher: { '@id': `${SITE}/#organization` },
        mainEntity: { '@id': `${url}#event` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Agenda', item: `${SITE}/agenda` },
          { '@type': 'ListItem', position: 3, name: event.title, item: url },
        ],
      },
      getEventStructuredData(event, now),
    ],
  };
}

export function getRelatedEvents(event: DogEvent, events: DogEvent[], now: Date = new Date()): DogEvent[] {
  const affinity = (candidate: DogEvent) => candidate.city === event.city ? 2 : candidate.region && candidate.region === event.region ? 1 : 0;
  return getUpcomingEvents(events, now).filter(candidate => candidate.slug !== event.slug)
    .sort((a, b) => affinity(b) - affinity(a) || a.date.localeCompare(b.date)).slice(0, 3);
}
