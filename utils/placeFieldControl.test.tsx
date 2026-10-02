import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { LEGACY_HOTSPOTS } from '../data/hotspots.ts';
import { LEGACY_SERVICES } from '../data/services.ts';
import { CITIES } from '../cityData.ts';
import type { Hotspot, Service } from '../types.ts';
import { contentDraftPatch, mergeContentDraft } from '../supabase/functions/_shared/contentDraft.ts';
import { resolvePublicPlace, parseHourPeriods, getHoursMode, publicPlaceText } from '../supabase/functions/_shared/placeFields.ts';
import { placeToValues, buildPlacePatch, applyPlacePatch } from './placeEditor.ts';
import { getPlaceSEO } from './placeSEO.ts';
import { ResolvedPlaceDetail } from '../pages/PlaceDetail.tsx';

const store = LEGACY_SERVICES.find(place => place.type === 'Dierenspeciaalzaak')!;
const city = CITIES.find(city => city.slug === store.city)!;
const render = (place: Service | Hotspot, kind: 'service' | 'hotspot' = 'service') => renderToStaticMarkup(<StaticRouter location="/admin/zaken/test"><ResolvedPlaceDetail preview place={place} kind={kind} cityData={city} /></StaticRouter>);
const business = (place: Service) => (getPlaceSEO(place, city, 'service').structuredData as Record<string, any>[]).find(item => item['@type'] === 'PetStore')!;

describe('consistent place field control', () => {
  it('supports service hours, all category families and canonical removal without changing unrelated data', () => {
    for (const [kind, places] of [['hotspot', LEGACY_HOTSPOTS], ['service', LEGACY_SERVICES]] as const) {
      for (const place of places) {
        const patch = contentDraftPatch.parse({ openingHours: { ma: ' 09:00–18:00 ', di: null, wo: '' } });
        const next = mergeContentDraft(kind, place as unknown as Record<string, unknown>, patch);
        expect(next).toEqual({ ...place, openingHours: { ma: '09:00–18:00', di: null } });
        expect(mergeContentDraft(kind, next, { openingHours: null })).toEqual({ ...place, openingHours: null });
      }
    }
  });
  it('rejects unknown controls and invalid time values, allows multiple periods and night hours', () => {
    for (const patch of [{ presentation: { injected: 'show' } }, { presentation: { hours: 'sometimes' } }, { openingHoursMode: 'always' }, { openingHours: { ma: '25:00–27:00' } }, { openingHours: { ma: 'open' } }, { openingHours: { ma: '10:00–10:00' } }]) expect(contentDraftPatch.safeParse(patch).success).toBe(false);
    for (const value of ['09:00–12:00, 14:00–18:00', '22:00–02:00', '09:00–24:00']) expect(contentDraftPatch.safeParse({ openingHours: { ma: value } }).success).toBe(true);
    expect(parseHourPeriods('nog te bevestigen')).toBeNull();
  });
  it('preserves hidden data and policies on later edits and category changes', () => {
    const hidden = mergeContentDraft('service', store as unknown as Record<string, unknown>, { openingHours: { ma: '09:00–18:00' }, presentation: { hours: 'hide', website: 'hide' } });
    const next = mergeContentDraft('service', hidden, { type: 'Dierenarts', presentation: { phone: 'show' }, name: ' Nieuwe naam ' });
    expect(next.openingHours).toEqual(hidden.openingHours);
    expect(next.presentation).toEqual({ hours: 'hide', website: 'hide', phone: 'show' });
    expect(resolvePublicPlace(next as unknown as Service).openingHours).toBeUndefined();
    expect(resolvePublicPlace(next as unknown as Service).website).toBeUndefined();
    expect(next.website).toBe(store.website);
  });
  it('hides optional content consistently in HTML, SEO, keywords and public text while retaining the source', () => {
    const source: Service = { ...store, phone: '+32 123', sameAs: ['https://example.test/social'], recommendationNote: 'Een speciale tip', practicalNote: 'Eigen advies', tags: ['Waterbak aanwezig', 'Specialty Coffee'], openingHours: { ma: '09:00–18:00' }, openingHoursNote: 'Speciale urenopmerking', openingHoursWeatherDependent: true, images: ['/extra.jpg'], presentation: { hours: 'hide', phone: 'hide', website: 'hide', socialLinks: 'hide', recommendation: 'hide', practicalAdvice: 'hide', dogInfo: 'hide', features: 'hide', gallery: 'hide' } };
    const before = JSON.stringify(source);
    const projected = resolvePublicPlace(source);
    expect(resolvePublicPlace(projected)).toEqual(projected);
    const html = render(source), seo = getPlaceSEO(source, city, 'service'), text = publicPlaceText(source);
    for (const value of ['+32 123', 'example.test/social', 'Een speciale tip', 'Eigen advies', 'Waterbak aanwezig', 'Specialty Coffee', '09:00', 'Speciale urenopmerking', '/extra.jpg']) {
      expect(html).not.toContain(value); expect(JSON.stringify(seo)).not.toContain(value); expect(text).not.toContain(value);
    }
    for (const marker of ['data-place-hours', 'data-place-availability', 'data-place-dog-info', 'data-place-gallery', 'data-place-advice']) expect(html).not.toContain(marker);
    expect(business(source)).not.toHaveProperty('openingHoursSpecification');
    expect(source.images).toEqual(['/extra.jpg']); expect(JSON.stringify(source)).toBe(before);
  });
  it('renders explicit modes without publishing a retained schedule as appointment hours', () => {
    const source: Service = { ...store, openingHours: { ma: '09:00–18:00', di: null }, openingHoursMode: 'appointment', openingHoursNote: 'Bel vooraf.', openingHoursWeatherDependent: true };
    expect(render(source)).toContain('Alleen op afspraak.'); expect(render(source)).toContain('weersafhankelijk');
    expect(render(source)).not.toContain('09:00'); expect(business(source)).not.toHaveProperty('openingHoursSpecification');
    const schedule: Service = { ...source, openingHoursMode: 'schedule' };
    expect(render(schedule)).toContain('09:00'); expect(render(schedule)).toContain('Gesloten');
    expect(business(schedule).openingHoursSpecification).toHaveLength(1);
    expect(publicPlaceText(schedule)).toContain('Openingstijden: ma: 09:00–18:00; di: gesloten');
  });
  it('never renders a blank schedule and distinguishes unknown from closed', () => {
    const empty: Service = { ...store, openingHours: { ma: '' } };
    expect(render(empty)).not.toContain('data-place-hours'); expect(getHoursMode(empty)).toBe('unknown');
    expect(render({ ...empty, presentation: { hours: 'show' } })).toContain('nog niet bevestigd');
    expect(render({ ...empty, openingHoursMode: 'not_applicable' })).not.toContain('data-place-availability');
    expect(render({ ...empty, openingHoursMode: 'not_applicable', presentation: { hours: 'show' } })).toContain('Geen vaste openingsuren');
  });
  it('roundtrips clearing days, visibility and explicit tag grouping through editor patches', () => {
    const original: Service = { ...store, openingHours: { ma: '09:00–18:00', di: null }, tags: ['Terras', 'Waterbak aanwezig'], presentation: { hours: 'hide' } };
    const values = { ...placeToValues(original), hours_ma: '', visibility_hours: 'show', group_Terras: 'dog' };
    const patch = contentDraftPatch.parse(buildPlacePatch({ hours_ma: '', visibility_hours: 'show', group_Terras: 'dog' }, values, original));
    const next = mergeContentDraft('service', original as unknown as Record<string, unknown>, patch) as unknown as Service;
    expect(next.openingHours).toEqual({ di: null }); expect(next.presentation).toEqual({ hours: 'show' });
    expect(applyPlacePatch(original, patch)).toEqual(next);
    expect(placeToValues(next).hours_ma).toBe(''); expect(placeToValues(next).hours_di).toBe('Gesloten');
    expect(render(next)).toContain('Terras');
    const removed = contentDraftPatch.parse(buildPlacePatch({ hours_di: '' }, { ...placeToValues(next), hours_di: '' }, next));
    expect(removed.openingHours).toBeNull();
  });
  it('respects explicit tag groups over legacy heuristics, keeps the recommendation marker separate', () => {
    const source: Service = { ...store, tags: ['Terras', 'Waterbak aanwezig', 'Aanrader'], tagGroups: { Terras: 'dog', 'Waterbak aanwezig': 'other' }, presentation: { features: 'hide' } };
    expect(resolvePublicPlace(source).tags).toEqual(['Terras', 'Aanrader']);
    expect(render(source)).toContain('Terras'); expect(render(source)).not.toContain('Waterbak aanwezig');
    expect(render(source)).not.toContain('Onze tip');
  });
  it('uses the edited name even for the former slug exception', () => {
    const cozy = LEGACY_HOTSPOTS.find(place => place.slug === 'cozy-moments')!;
    expect(render({ ...cozy, name: 'Gewijzigde zaaknaam' }, 'hotspot')).toContain('Gewijzigde zaaknaam');
    expect(render({ ...cozy, name: 'Gewijzigde zaaknaam' }, 'hotspot')).not.toContain('COZY Moments');
  });
});
