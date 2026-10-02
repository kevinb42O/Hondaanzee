import { describe, expect, it } from 'vitest';
import { CITIES } from '../cityData.ts';
import { HOTSPOTS, SERVICES, OFF_LEASH_AREAS } from '../constants.ts';
import { normalizeSearch, searchSite } from './search.ts';

describe('homepage search', () => {
  it.each(['de potiniere', 'la potinière', 'POTINIÈRE', '  Brasserie   La Potiniere  ', 'potini', 'potinere', 'potineire'])(
    'finds La Potinière first for %s', query => {
      expect(searchSite(query)[0]).toMatchObject({
        name: 'Brasserie La Potinière', path: '/de-haan/hotspots/brasserie-la-potiniere', kind: 'hotspot',
      });
    },
  );

  it('marks typo matches without treating an unaccented spelling as a typo', () => {
    expect(searchSite('potinere')[0].approximate).toBe(true);
    expect(searchSite('potiniere')[0].approximate).toBe(false);
  });

  it.each(CITIES)('ranks $name above its local places', city => {
    expect(searchSite(city.name)[0]).toMatchObject({ kind: 'city', path: `/${city.slug}` });
  });

  it('accepts city aliases and punctuation', () => {
    expect(searchSite('Knokke')[0].path).toBe('/knokke-heist');
    expect(searchSite('de-haan')[0].path).toBe('/de-haan');
    expect(normalizeSearch('  Café — De Haan  ')).toBe('cafe de haan');
  });

  it.each(['restaurant De Haan', 'restaurants in de haan', 'De Haan restaurant'])(
    'combines food categories with a city for %s', query => {
      const results = searchSite(query);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(result => result.name === 'Brasserie La Potinière')).toBe(true);
      expect(results.every(result => result.cityName === 'De Haan' && ['Restaurant', 'Brasserie'].includes(result.label))).toBe(true);
    },
  );

  it('finds services by category and municipality', () => {
    const results = searchSite('dierenarts Oostende');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(result => result.kind === 'service' && result.cityName === 'Oostende' && result.label === 'Dierenarts'), JSON.stringify(results.map(result => [result.name, result.cityName]))).toBe(true);
  });

  it('finds hotels and losloopzones with their existing routes', () => {
    const hotels = searchSite('hotel Oostende');
    expect(hotels.length).toBeGreaterThan(0);
    expect(hotels.every(result => result.kind === 'hotspot' && result.cityName === 'Oostende' && result.label === 'Slapen')).toBe(true);
    const areas = searchSite('losloopzone De Haan');
    expect(areas.length).toBeGreaterThan(0);
    expect(areas.every(result => result.kind === 'off-leash' && result.cityName === 'De Haan' && result.path.startsWith('/losloopzones/'))).toBe(true);
  });

  it('makes every catalog entry discoverable by its full name without duplicate result IDs', () => {
    for (const [kind, places] of [['hotspot', HOTSPOTS], ['service', SERVICES], ['off-leash', OFF_LEASH_AREAS]] as const) {
      for (const place of places) {
        const results = searchSite(place.name);
        expect(results.some(result => result.id === `${kind}:${place.slug}`), place.name).toBe(true);
        expect(new Set(results.map(result => result.id)).size).toBe(results.length);
      }
    }
  });

  it('does not invent results for empty, unrelated or conflicting searches', () => {
    for (const query of ['', '  ', '🦄', 'zzzzzzzzzzz', 'potiniere Oostende', 'dierenarts De Haan Blankenberge']) {
      expect(searchSite(query), query).toEqual([]);
    }
  });
});
