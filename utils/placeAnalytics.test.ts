import { describe, expect, it, vi } from 'vitest';
import { track } from '@vercel/analytics';
import { HOTSPOTS } from '../data/hotspots.ts';
import { getAnalyticsPath, normalizeAnalyticsEvent, trackPlaceAction } from './placeAnalytics.ts';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

describe('business analytics', () => {
  it('groups tracking parameters and trailing slashes under the same page', () => {
    expect(normalizeAnalyticsEvent({ type: 'pageview', url: 'https://hondaanzee.be/blankenberge/hotspots/lakaiann/?utm_source=google#foto' }))
      .toEqual({ type: 'pageview', url: 'https://hondaanzee.be/blankenberge/hotspots/lakaiann' });
    expect(getAnalyticsPath('/')).toBe('/');
  });

  it('keeps individual business URLs separate', () => {
    expect(getAnalyticsPath('/blankenberge/hotspots/lakaiann')).not.toBe(getAnalyticsPath('/blankenberge/hotspots/cozy-moments'));
  });

  it('sends the permanent business URL and action within two custom properties', () => {
    trackPlaceAction(HOTSPOTS[0], 'hotspot', 'website');
    expect(track).toHaveBeenCalledWith('Zaakcontact', { zaak: '/blankenberge/hotspots/lakaiann', actie: 'website' });
  });
});
