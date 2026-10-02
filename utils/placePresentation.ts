import type { Hotspot, Service } from '../types';

export type Place = Hotspot | Service;
export type PlaceCategory = 'food' | 'stay' | 'care' | 'shop';

export { getPlaceCategory, CATEGORY_COPY } from '../supabase/functions/_shared/placeFields.ts';
import { getTagGroup, resolvePublicPlace } from '../supabase/functions/_shared/placeFields.ts';

/** Group supplied labels only; never infer indoor access, costs, urgency or quality. */
export function getPlaceFacts(place: Place) {
  const tags = [...new Set(resolvePublicPlace(place).tags)].filter(tag => tag !== 'Aanrader');
  const dog = tags.filter(tag => getTagGroup(place, tag) === 'dog');
  return { dog, other: tags.filter(tag => !dog.includes(tag)) };
}

export function getPlaceImages(place: Place): string[] {
  return [...new Set(place.images?.length ? place.images : [place.image])];
}

export function getPlaceIntro(place: Place, cityName: string): string {
  if (place.summary?.trim()) return place.summary.trim();
  return `${place.type === 'Slapen' ? 'Verblijf' : place.type} in ${cityName}.`;
}

export const directionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
