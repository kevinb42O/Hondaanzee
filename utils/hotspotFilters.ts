export interface HotspotFilters {
  cities: string[];
  types: string[];
  query: string;
}

export function readHotspotFilters(params: URLSearchParams, validCities: Set<string>, validTypes: Set<string>): HotspotFilters {
  return {
    cities: [...new Set(params.getAll('city').filter(city => validCities.has(city)))],
    types: [...new Set(params.getAll('type').filter(type => validTypes.has(type)))],
    query: params.get('q') || '',
  };
}

export function buildHotspotFilterParams({ cities, types, query }: HotspotFilters): URLSearchParams {
  const params = new URLSearchParams();
  [...new Set(cities)].forEach(city => params.append('city', city));
  [...new Set(types)].forEach(type => params.append('type', type));
  if (query.trim()) params.set('q', query.trim());
  return params;
}
