import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from '@vercel/analytics';
import { trackWebaanzeeAction, webaanzeeUrl } from './webaanzeeAnalytics.ts';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

function browser(hostname = 'hondaanzee.be', privacy = {}) {
  vi.stubGlobal('window', { location: { hostname } });
  vi.stubGlobal('navigator', { webdriver: false, doNotTrack: null, ...privacy });
}

describe('Webaanzee funnel measurement', () => {
  it('respects privacy preferences and excludes local or automated visits', () => {
    for (const privacy of [{ doNotTrack: '1' }, { globalPrivacyControl: true }, { webdriver: true }]) {
      browser('hondaanzee.be', privacy);
      trackWebaanzeeAction('over-ons', 'bekeken');
    }
    browser('localhost');
    trackWebaanzeeAction('footer', 'voorbeelden-bekeken');
    expect(track).not.toHaveBeenCalled();
  });
  it('measures intent with two fixed properties and no contact information', () => {
    browser();
    trackWebaanzeeAction('zaak-aanmelden', 'email-geopend');
    expect(track).toHaveBeenCalledWith('Webaanzee', { plek: 'zaak-aanmelden', actie: 'email-geopend' });
  });
  it('distinguishes referral placements at the destination', () => {
    for (const source of ['zaak-aanmelden', 'over-ons', 'footer'] as const) {
      const url = new URL(webaanzeeUrl(source));
      expect(url.hostname).toBe('www.webaanzee.be');
      expect(url.searchParams.get('utm_source')).toBe('hondaanzee');
      expect(url.searchParams.get('utm_content')).toBe(source);
    }
  });
});
