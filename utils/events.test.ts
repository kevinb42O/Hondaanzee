import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { EVENTS, type DogEvent } from '../data/events.ts';
import { FUTURE_EVENTS } from '../data/futureEvents.ts';
import { absoluteEventImage, getAgendaStructuredData, getBelgianEventDate, getEventCountdown, getEventStructuredData, getUpcomingEvents, isEventPast, getEventSEO, getRelatedEvents } from './events.ts';

const event = (changes: Partial<DogEvent> = {}): DogEvent => ({
  ...FUTURE_EVENTS[0], date: '2026-10-24', endDate: '2026-10-25',
  schemaStartDate: '2026-10-24', schemaEndDate: '2026-10-25', ...changes,
});

describe('agenda dates in Belgium', () => {
  it('uses the Belgian day around UTC midnight', () => {
    expect(getBelgianEventDate(new Date('2026-10-03T23:00:00Z'))).toBe('2026-10-04');
    expect(getEventCountdown(event({ date: '2026-10-04', schemaEndDate: '2026-10-04' }), new Date('2026-10-03T23:00:00Z'))).toBe('Vandaag');
  });
  it('counts calendar days correctly across the winter clock change', () => {
    const onMonday = event({ date: '2026-10-26', endDate: '2026-10-26', schemaEndDate: '2026-10-26' });
    expect(getEventCountdown(onMonday, new Date('2026-10-24T22:30:00Z'))).toBe('Morgen');
  });
  it('keeps an ongoing multi-day event through its last Belgian day', () => {
    const ongoing = event();
    expect(getEventCountdown(ongoing, new Date('2026-10-25T22:59:00Z'))).toBe('Nu bezig');
    expect(isEventPast(ongoing, new Date('2026-10-25T23:00:00Z'))).toBe(true);
  });
  it('moves an event to the archive at a confirmed closing time', () => {
    const timed = event({ schemaEndDate: '2026-10-25T12:30:00+01:00' });
    expect(isEventPast(timed, new Date('2026-10-25T11:29:59Z'))).toBe(false);
    expect(isEventPast(timed, new Date('2026-10-25T11:30:00Z'))).toBe(true);
  });
  it('keeps current editions, excludes old ones and sorts without mutating', () => {
    const now = new Date('2026-10-03T10:00:00+02:00');
    const input = [...EVENTS].reverse();
    const before = [...input];
    const upcoming = getUpcomingEvents(input, now);
    expect(upcoming).toHaveLength(18);
    expect(upcoming.some(item => item.id < 100)).toBe(false);
    expect(upcoming.map(item => item.date)).toEqual(upcoming.map(item => item.date).sort());
    expect(input).toEqual(before);
    expect(getAgendaStructuredData(EVENTS, now)[1].numberOfItems).toBe(18);
  });
});

describe('accurate event metadata', () => {
  const now = new Date('2026-10-03T10:00:00+02:00');
  it('does not interpret free children or dogs as free general entry', () => {
    const paid = event({ price: '€12,50; honden en kinderen gratis', isAccessibleForFree: false, entryPrice: 12.5, ticketUrl: 'https://tickets.example/event' });
    const schema = getEventStructuredData(paid, now);
    expect(schema.isAccessibleForFree).toBe(false);
    expect(schema.offers?.price).toBe(12.5);
    expect(schema.offers).not.toHaveProperty('availability');
  });
  it('omits prices, free status and images when they are unknown', () => {
    const unknown = event({ price: 'Nog niet bekend', entryPrice: undefined, isAccessibleForFree: undefined, image: undefined });
    const schema = JSON.parse(JSON.stringify(getEventStructuredData(unknown, now)));
    expect(schema).not.toHaveProperty('offers');
    expect(schema).not.toHaveProperty('image');
    expect(schema).not.toHaveProperty('isAccessibleForFree');
    expect(absoluteEventImage(unknown)).toBeUndefined();
  });
  it('supports genuinely free admission and stops offering expired tickets', () => {
    const free = event({ entryPrice: 0, isAccessibleForFree: true, ticketUrl: 'https://tickets.example/free' });
    expect(getEventStructuredData(free, now).offers?.price).toBe(0);
    expect(getEventStructuredData(free, new Date('2026-10-27'))).not.toHaveProperty('offers');
  });
  it('uses the correct country without guessing a street for incomplete locations', () => {
    const dutch = event({ country: 'NL', structuredAddress: { addressLocality: 'Noordwelle' }, address: undefined });
    const address = getEventStructuredData(dutch, now).location.address;
    expect(address.addressCountry).toBe('NL');
    expect(address).not.toHaveProperty('streetAddress');
  });
  it('does not carry the 2026 Bredene price or hours into its new edition', () => {
    const bredene = FUTURE_EVENTS.find(item => item.slug.includes('bredene'))!;
    expect(bredene.date).toBe('2027-06-13');
    expect(bredene.schemaStartDate).toBe('2027-06-13');
    expect(bredene.entryPrice).toBeUndefined();
    expect(bredene.status).toBe('save-the-date');
  });
});

describe('published event inventory', () => {
  it('has unique routes and verified sources for every new event', () => {
    expect(new Set(EVENTS.map(item => item.id)).size).toBe(EVENTS.length);
    expect(new Set(EVENTS.map(item => item.slug)).size).toBe(EVENTS.length);
    for (const item of FUTURE_EVENTS) {
      expect(item.sources?.length).toBeGreaterThan(0);
      expect(item.lastVerified).toBe('2026-10-03');
      expect(item.dogPolicy).toBeTruthy();
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.schemaEndDate.slice(0, 10) >= item.date).toBe(true);
      if (item.image) {
        expect(existsSync(`public${item.image}`), item.image).toBe(true);
        expect(item.imageAlt).toBeTruthy();
        expect(item.imageCaption).toBeTruthy();
        expect(item.imageCredit).toBeTruthy();
        expect(item.imageSourceUrl).toMatch(/^https:\/\//);
      }
      for (const image of item.detailGallery?.images || []) expect(existsSync(`public${image.src}`), image.src).toBe(true);
    }
  });
});

describe('event search pages and discovery', () => {
  const now = new Date('2026-10-03T10:00:00+02:00');
  it('keeps edition years and links all schema entities to the same canonical page', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const item of EVENTS) {
      const seo = getEventSEO(item, now);
      expect(seo.title).toContain(item.date.slice(0, 4));
      expect(seo.canonical).toBe(`https://hondaanzee.be/agenda/${item.slug}`);
      expect(seo.description).toContain(item.dateDisplay);
      expect(seo.description).toContain(item.cityName);
      expect(seo.description.length).toBeLessThanOrEqual(200);
      expect(titles.has(seo.title)).toBe(false);
      expect(descriptions.has(seo.description)).toBe(false);
      titles.add(seo.title); descriptions.add(seo.description);
      const [page, breadcrumb, schema] = seo.structuredData;
      expect(page).toMatchObject({ '@type': 'WebPage', '@id': `${seo.canonical}#webpage`, mainEntity: { '@id': `${seo.canonical}#event` } });
      expect(breadcrumb).toMatchObject({ '@type': 'BreadcrumbList', '@id': `${seo.canonical}#breadcrumb` });
      expect(schema).toMatchObject({ '@type': 'Event', '@id': `${seo.canonical}#event`, mainEntityOfPage: { '@id': `${seo.canonical}#webpage` } });
    }
    const old = getEventSEO(EVENTS[0], new Date('2028-01-01'));
    expect(old.title).toContain('2026');
    expect(old.title).not.toContain('2028');
    expect(old.description).toContain('Voorbije editie');
    const winter = EVENTS.find(item => item.slug === 'lichtgolf-oostende-2026')!;
    expect(getEventSEO(winter, now).title).toContain('2026–2027');
  });
  it('publishes offers only for confirmed bookable prices, with visible booking links', () => {
    expect(getEventStructuredData(event({ entryPrice: 8, website: 'https://organizer.example/' }), now)).not.toHaveProperty('offers');
    for (const item of EVENTS) {
      if (!item.ticketUrl) continue;
      const links = [item.website, ...(item.additionalLinks || []).map(link => link.url), ...(item.sources || []).map(source => source.url)];
      expect(links).toContain(item.ticketUrl);
      expect(getEventStructuredData(item, now).offers).toMatchObject({ price: item.entryPrice, url: item.ticketUrl, priceCurrency: 'EUR' });
    }
  });
  it('uses page links on the agenda instead of combining many Event entities on one page', () => {
    const [page, list] = getAgendaStructuredData(EVENTS, now);
    expect(page).toMatchObject({ mainEntity: { '@id': 'https://hondaanzee.be/agenda#evenementen' } });
    expect(list.itemListElement?.every(row => row.item['@type'] === 'WebPage')).toBe(true);
    expect(JSON.stringify([page, list])).not.toContain('"@type":"Event"');
  });
  it('points an archived edition to its next local edition without linking back to itself or other expired events', () => {
    const old = EVENTS.find(item => item.slug === 'grote-hondenwandeling-bredene-2026')!;
    const related = getRelatedEvents(old, EVENTS, now);
    expect(related[0].slug).toBe('hondenwandeling-bredene-2027');
    expect(related).toHaveLength(3);
    expect(related.every(item => item.slug !== old.slug && !isEventPast(item, now))).toBe(true);
    const only = event();
    expect(getRelatedEvents(only, [only], now)).toEqual([]);
  });
});
