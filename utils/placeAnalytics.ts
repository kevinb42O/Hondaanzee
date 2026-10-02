import { track, type BeforeSendEvent } from '@vercel/analytics';
import { getPlaceDetailPath, type PlaceKind } from './placeRoutes.ts';
import type { Hotspot, Service } from '../types.ts';

export const getAnalyticsPath = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

export function normalizeAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  url.pathname = getAnalyticsPath(url.pathname);
  url.search = '';
  url.hash = '';
  return { ...event, url: url.toString() };
}

export function trackPlaceAction(place: Hotspot | Service, kind: PlaceKind, action: 'website' | 'route' | 'telefoon' | 'social') {
  // Two properties also fit the standard Pro plan, without Analytics Plus.
  track('Zaakcontact', { zaak: getPlaceDetailPath(place, kind), actie: action });
}
