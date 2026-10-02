import { describe, expect, it } from 'vitest';
import { contentDraftRequest, contentDraftPatch, mergeContentDraft, CONTENT_CITIES } from '../supabase/functions/_shared/contentDraft.ts';
import { HOTSPOTS, SERVICES } from '../data/index.ts';
import { CITIES } from '../cityData.ts';

describe('admin content editing', () => {
  it('retains every existing optional field and image reference when editing a name', () => {
    for (const [kind, catalog] of [['hotspot', HOTSPOTS], ['service', SERVICES]] as const) {
      for (const place of catalog) {
        const result = mergeContentDraft(kind, place as unknown as Record<string, unknown>, { name: 'Aangepaste naam' });
        expect(result).toEqual({ ...place, name: 'Aangepaste naam' });
      }
    }
  });
  it('rejects image changes, identity changes, unknown fields and executable links', () => {
    for (const patch of [{ image: 'https://other.test/image.jpg' }, { images: [] }, { id: 12 }, { city: 'oostende' }, { slug: 'gewijzigd' }, { injected: true }, { website: 'javascript:alert(1)' }, { website: 'https://user:password@example.com' }]) {
      expect(contentDraftPatch.safeParse(patch).success).toBe(false);
    }
  });
  it('rejects categories from another kind but supports service opening hours', () => {
    expect(() => mergeContentDraft('hotspot', {}, { type: 'Dierenarts' })).toThrow();
    expect(mergeContentDraft('service', {}, { openingHoursNote: 'Test', openingHours: { ma: '09:00–18:00' } })).toMatchObject({ openingHoursNote: 'Test', openingHours: { ma: '09:00–18:00' } });
  });
  it('requires complete minimum data and a stable route for new drafts', () => {
    const request = { action: 'create', kind: 'hotspot', city: 'blankenberge', slug: 'nieuwe-zaak', patch: { name: 'Nieuwe zaak', description: 'Een beschrijving', address: 'Kerkstraat 1', type: 'Café' } };
    expect(contentDraftRequest.safeParse(request).success).toBe(true);
    expect(contentDraftRequest.safeParse({ ...request, slug: '../test' }).success).toBe(false);
    expect(contentDraftRequest.safeParse({ ...request, patch: { name: 'Nieuwe zaak' } }).success).toBe(false);
    expect([...CONTENT_CITIES].sort()).toEqual(CITIES.map(city => city.slug).sort());
  });
});
