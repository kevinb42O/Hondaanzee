import { describe, expect, it } from 'vitest';
import { HOTSPOTS } from '../data/hotspots.ts';
import { SERVICES } from '../data/services.ts';
import { CITIES } from '../cityData.ts';
import { getPlaceSEO, getPlacePostalAddress } from './placeSEO.ts';
import type { Hotspot, Service } from '../types.ts';

const getCity = (place: Hotspot | Service) => CITIES.find((city) => city.slug === place.city)!;

describe('individual business SEO', () => {
  it('starts every title with the exact business name and identifies the publisher', () => {
    for (const [kind, places] of [['hotspot', HOTSPOTS], ['service', SERVICES]] as const) {
      for (const place of places) {
        const seo = getPlaceSEO(place, getCity(place), kind);
        expect(seo.title.startsWith(place.name)).toBe(true);
        expect(seo.title.endsWith(' | HondAanZee.be')).toBe(true);
        expect(seo.description).toContain(place.name);
        expect(seo.description).toContain(getCity(place).name);
        expect(seo.description.length).toBeLessThanOrEqual(165);
      }
    }
  });

  it('uses the given postal locality rather than substituting the municipality', () => {
    expect(getPlacePostalAddress('Westkapellestraat 438, 8300 Westkapelle', 'Knokke-Heist')).toEqual({
      '@type': 'PostalAddress', streetAddress: 'Westkapellestraat 438', postalCode: '8300', addressLocality: 'Westkapelle', addressCountry: 'BE',
    });
    expect(getPlacePostalAddress('Adres zonder postcode', 'Oostende')).not.toHaveProperty('postalCode');
  });

  it('connects the directory page to the business and adds only supplied contact details', () => {
    const place = HOTSPOTS.find((entry) => entry.slug === 'brasserie-la-potiniere')!;
    const seo = getPlaceSEO(place, getCity(place), 'hotspot');
    const schemas = seo.structuredData as Record<string, any>[];
    const page = schemas.find((entry) => entry['@type'] === 'WebPage')!;
    const business = schemas.find((entry) => entry['@id'] === `${seo.canonical}#business`)!;
    expect(page.mainEntity['@id']).toBe(business['@id']);
    expect(business.address.postalCode).toBe('8420');
    expect(business.sameAs).toContain(place.website);
    expect(business).not.toHaveProperty('openingHoursSpecification');
    expect(business).not.toHaveProperty('aggregateRating');
    expect(business.description).toBe(place.description.replace(/\s+/g, ' ').trim());
  });

  it('uses the specific schema for a pet store', () => {
    const place = SERVICES.find((entry) => entry.type === 'Dierenspeciaalzaak')!;
    const schemas = getPlaceSEO(place, getCity(place), 'service').structuredData as Record<string, any>[];
    expect(schemas.some((entry) => entry['@type'] === 'PetStore')).toBe(true);
  });
});
