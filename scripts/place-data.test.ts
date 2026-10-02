import { describe, expect, it } from 'vitest';
import { HOTSPOTS } from '../data/hotspots.ts';
import { SERVICES } from '../data/services.ts';
import { CITIES } from '../cityData.ts';
import { validatePlaceData } from './validate-place-data.cjs';
import { buildStaticHtml } from './static-html.cjs';
import { getPlacePageRevisions } from './place-page-revisions.cjs';

describe('business page build safety', () => {
  it('changes lastmod only for revised businesses or a revised page template', () => {
    const data = { HOTSPOTS: HOTSPOTS.slice(0, 2), SERVICES: [], CITIES };
    const initial = getPlacePageRevisions(data, {}, 'template-v1', '2026-10-02');
    const rebuild = getPlacePageRevisions(data, initial, 'template-v1', '2026-10-03');
    expect(rebuild).toEqual(initial);
    const changed = { ...data, HOTSPOTS: [{ ...data.HOTSPOTS[0], description: 'Bijgewerkte informatie.' }, data.HOTSPOTS[1]] };
    const revision = getPlacePageRevisions(changed, initial, 'template-v1', '2026-10-03');
    const [first, second] = Object.keys(revision);
    expect(revision[first].lastmod).toBe('2026-10-03');
    expect(revision[second].lastmod).toBe('2026-10-02');
    const templateChange = getPlacePageRevisions(data, initial, 'template-v2', '2026-10-04');
    expect(Object.values(templateChange).every((entry) => entry.lastmod === '2026-10-04')).toBe(true);
  });
  it('covers every published business once', () => {
    expect(validatePlaceData({ HOTSPOTS, SERVICES, CITIES }).size).toBe(HOTSPOTS.length + SERVICES.length);
  });

  it('rejects duplicate URLs instead of silently hiding a business', () => {
    expect(() => validatePlaceData({ HOTSPOTS: [...HOTSPOTS, { ...HOTSPOTS[0], id: 9999 }], SERVICES, CITIES }))
      .toThrow('Duplicate business URL');
  });

  it('rejects unknown cities and missing slugs', () => {
    expect(() => validatePlaceData({ HOTSPOTS: [{ ...HOTSPOTS[0], city: 'onbekend' }], SERVICES, CITIES })).toThrow('Unknown city');
    expect(() => validatePlaceData({ HOTSPOTS: [{ ...HOTSPOTS[0], slug: '' }], SERVICES, CITIES })).toThrow('Invalid permanent slug');
  });

  it('replaces homepage SEO and safely embeds text and structured data', () => {
    const shell = '<head><title>Home</title><meta name="description" content="Home"><meta property="og:title" content="Home"><link rel="canonical" href="https://hondaanzee.be/"><link rel="preload" as="image" href="/lexi.webp"></head><body><div id="hero-prerender"></div><div id="root"></div><script src="/assets/app.js"></script></body>';
    const html = buildStaticHtml(shell, '<h1>Een zaak</h1>', { title: 'A & B', description: '"Beschrijving"', canonical: 'https://hondaanzee.be/zaak', structuredData: { name: '</script><script>bad()</script>' } });
    expect(html).toContain('<title>A &amp; B</title>');
    expect(html).toContain('content="&quot;Beschrijving&quot;"');
    expect(html).not.toContain('content="Home"');
    expect(html).not.toContain('hero-prerender');
    expect(html).not.toContain('/lexi.webp');
    expect(html).not.toContain('<script>bad()');
    expect(html).toContain('<div id="root"><h1>Een zaak</h1></div>');
    expect(html).toContain('/assets/app.js');
  });
});
