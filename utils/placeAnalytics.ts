import { isMeasuredPath } from '../supabase/functions/_shared/siteAnalytics.ts';
import { recordSiteEvent } from './siteAnalytics.ts';
import { track, type BeforeSendEvent } from '@vercel/analytics';
import { getPlaceDetailPath, type PlaceKind } from './placeRoutes.ts';
import type { Hotspot, Service } from '../types.ts';

export const getAnalyticsPath = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

export function normalizeAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  // Also exclude late SDK events after navigating from a public page to admin.
  if (!isMeasuredPath(getAnalyticsPath(url.pathname))) return null;
  url.pathname = getAnalyticsPath(url.pathname);
  url.search = '';
  url.hash = '';
  return { ...event, url: url.toString() };
}

export function trackPlaceAction(place: Hotspot | Service, kind: PlaceKind, action: 'website' | 'route' | 'telefoon' | 'social') {
  if(typeof window!=='undefined' && !isMeasuredPath(window.location.pathname))return;
  // Two properties also fit the standard Pro plan, without Analytics Plus.
  recordSiteEvent(getPlaceDetailPath(place, kind), action);
  track('Zaakcontact', { zaak: getPlaceDetailPath(place, kind), actie: action });
}
