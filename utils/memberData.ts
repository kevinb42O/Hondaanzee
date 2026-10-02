import { HOTSPOTS, SERVICES, OFF_LEASH_AREAS } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { getPlaceDetailPath } from './placeRoutes.ts';
export * from './memberStore.ts';
import { placeKey, type SavedPlace } from './memberStore.ts';

export type ResolvedSavedPlace = SavedPlace & { key: string; name: string; image: string; path: string; cityName: string; category: string; address: string; lat: number; lng: number; exactLocation: boolean };

export function resolveSavedPlace(reference: SavedPlace): ResolvedSavedPlace | null {
  if (!reference || !['hotspot', 'service', 'offleash'].includes(reference.kind) || typeof reference.city_slug !== 'string' || typeof reference.place_slug !== 'string') return null;
  const city = CITIES.find(c => c.slug === reference.city_slug);
  if (!city) return null;
  const place = reference.kind === 'offleash'
    ? OFF_LEASH_AREAS.find(p => p.city === reference.city_slug && p.slug === reference.place_slug)
    : (reference.kind === 'hotspot' ? HOTSPOTS : SERVICES).find(p => p.city === reference.city_slug && p.slug === reference.place_slug);
  if (!place) return null;
  const exactLocation = 'lat' in place;
  return { ...reference, key: placeKey(reference), name: place.name, image: place.image || city.image,
    path: reference.kind === 'offleash' ? `/losloopzones/${place.slug}` : getPlaceDetailPath(place as typeof HOTSPOTS[number], reference.kind),
    cityName: city.name, category: 'type' in place ? place.type : 'Losloopzone', address: place.address,
    lat: exactLocation ? place.lat : city.lat, lng: exactLocation ? place.lng : city.lng, exactLocation };
}
export const MEMBER_CATALOG: ResolvedSavedPlace[] = [
  ...HOTSPOTS.map(p => ({ kind: 'hotspot' as const, city_slug: p.city, place_slug: p.slug })),
  ...SERVICES.map(p => ({ kind: 'service' as const, city_slug: p.city, place_slug: p.slug })),
  ...OFF_LEASH_AREAS.map(p => ({ kind: 'offleash' as const, city_slug: p.city, place_slug: p.slug })),
].map(resolveSavedPlace).filter((p): p is ResolvedSavedPlace => p !== null);
