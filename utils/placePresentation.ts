import type { Hotspot, Service } from '../types';

export type Place = Hotspot | Service;
export type PlaceCategory = 'food' | 'stay' | 'care' | 'shop';

export function getPlaceCategory(place: Place): PlaceCategory {
  if (place.type === 'Slapen') return 'stay';
  if (place.type === 'Dierenarts') return 'care';
  if (place.type === 'Shoppen' || place.type === 'Dierenspeciaalzaak') return 'shop';
  return 'food';
}

export const CATEGORY_COPY = {
  food: { label: 'Eten & drinken', title: 'Voor je bezoek', note: 'Vraag bij het reserveren of bij aankomst welke plek geschikt is voor jou en je hond.', website: 'Bekijk de website' },
  stay: { label: 'Overnachten', title: 'Voor je verblijf', note: 'Vraag vóór je boekt naar een eventuele hondentoeslag, het aantal toegelaten honden en de ruimtes waar je hond mee mag.', website: 'Bekijk het verblijf' },
  care: { label: 'Dierenarts', title: 'Afspraak & consultatie', note: 'Neem contact op met de praktijk voor een afspraak en beschikbaarheid. Controleer bij spoed welke praktijk of wachtdienst bereikbaar is.', website: 'Naar de praktijkwebsite' },
  shop: { label: 'Winkels & advies', title: 'Voor je winkelbezoek', note: 'Bekijk het aanbod op de website van de zaak. Vraag vooraf naar de beschikbaarheid van een product of dienst.', website: 'Bekijk de winkelwebsite' },
} satisfies Record<PlaceCategory, { label: string; title: string; note: string; website: string }>;

/** Group supplied labels only; never infer indoor access, costs, urgency or quality. */
export function getPlaceFacts(place: Place) {
  const tags = [...new Set(place.tags)].filter(tag => tag !== 'Aanrader');
  const dog = tags.filter(tag => /hond|waterbak|voer\/drinkbak|indoor toegelaten|dekentje/i.test(tag));
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
