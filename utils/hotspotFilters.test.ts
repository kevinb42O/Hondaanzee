import { describe, expect, it } from 'vitest';
import { buildHotspotFilterParams, readHotspotFilters } from './hotspotFilters.ts';

const cities = new Set(['oostende', 'de-haan', 'blankenberge']);
const types = new Set(['Restaurant', 'Koffiebar', 'Café']);

describe('hotspot filter links', () => {
  it('keeps existing single-selection links working', () => {
    expect(readHotspotFilters(new URLSearchParams('city=de-haan&type=Restaurant&q=Sam'), cities, types))
      .toEqual({ cities: ['de-haan'], types: ['Restaurant'], query: 'Sam' });
  });

  it('round-trips multiple municipalities, types and an accented search term', () => {
    const filters = { cities: ['oostende', 'de-haan'], types: ['Café', 'Restaurant'], query: 'Café & Zee' };
    const params = buildHotspotFilterParams(filters);
    expect(params.getAll('city')).toEqual(filters.cities);
    expect(params.getAll('type')).toEqual(filters.types);
    expect(readHotspotFilters(new URLSearchParams(params.toString()), cities, types)).toEqual(filters);
  });

  it('ignores unknown and legacy all values without losing valid selections', () => {
    expect(readHotspotFilters(new URLSearchParams('city=all&city=de-haan&city=invalid&city=de-haan&type=all&type=Caf%C3%A9&type=invalid'), cities, types))
      .toEqual({ cities: ['de-haan'], types: ['Café'], query: '' });
  });

  it('creates a clean URL when filters are cleared and trims typed queries', () => {
    expect(buildHotspotFilterParams({ cities: [], types: [], query: '  ' }).toString()).toBe('');
    expect(buildHotspotFilterParams({ cities: ['oostende', 'oostende'], types: ['Restaurant', 'Restaurant'], query: '  Sam  ' }).toString())
      .toBe('city=oostende&type=Restaurant&q=Sam');
  });
});
