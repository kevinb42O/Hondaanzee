import { describe, expect, it } from 'vitest';
import { filterReviewInsightPlaces, reviewInsightPublicPath, reviewInsightsCsv, reviewPlacePath, type ReviewInsightPlace } from './reviewInsights.ts';
const base: ReviewInsightPlace = { place_id: 'a', kind: 'hotspot', city_slug: 'oostende', place_slug: 'cafe', name: 'Café A', image: '', status: 'published', like_count: 2, excluded_like_count: 0, recent7_like_count: 1, recent30_like_count: 2, review_count: 3, published_count: 1, pending_count: 2, attention_count: 2, average: 4, last_like_at: '2026-10-01T12:00:00Z', last_review_at: '2026-10-02T12:00:00Z', last_activity_at: '2026-10-02T12:00:00Z' };
const filters = { query: '', city: '', kind: '', metric: 'like_count' as const, includeEmpty: false, selected: '' };
describe('review insights', () => {
  it('keeps places with only excluded likes traceable, and hides truly empty places by default', () => {
    const excluded = { ...base, place_id: 'b', like_count: 0, excluded_like_count: 1, review_count: 0 };
    const empty = { ...excluded, place_id: 'c', excluded_like_count: 0 };
    expect(filterReviewInsightPlaces([empty, excluded, base], filters, {}).map(p => p.place_id)).toEqual(['a', 'b']);
    expect(filterReviewInsightPlaces([empty], { ...filters, includeEmpty: true, selected: 'c' }, {})).toEqual([empty]);
  });
  it('combines accent-insensitive search, municipality, kind and place selection', () => {
    expect(filterReviewInsightPlaces([base], { ...filters, query: 'cafe', city: 'oostende', kind: 'hotspot', selected: 'a' }, {})).toEqual([base]);
    expect(filterReviewInsightPlaces([base], { ...filters, city: 'de-haan' }, {})).toEqual([]);
    expect(filterReviewInsightPlaces([base], { ...filters, query: 'Oosténdé' }, { oostende: 'Oostende' })).toEqual([base]);
  });
  it('sorts recent activity by date without inventing dates for empty places', () => {
    const newer = { ...base, place_id: 'b', like_count: 0, last_activity_at: '2026-10-03T12:00:00Z' };
    const undated = { ...base, place_id: 'c', last_activity_at: null };
    expect(filterReviewInsightPlaces([undated, base, newer], { ...filters, metric: 'last_activity_at' }, {}).map(p => p.place_id)).toEqual(['b', 'a', 'c']);
  });
  it('makes stable place filters and omits public links to unavailable places', () => {
    expect(reviewPlacePath('a', 'attention')).toBe('/admin/reviews?zone=a&filter=attention');
    expect(reviewInsightPublicPath({ ...base, status: 'archived' })).toBeNull();
    expect(reviewInsightPublicPath({ ...base, kind: 'offleash' })).toBe('/losloopzones/cafe');
  });
  it('exports the actual filtered snapshot, keeps absent scores blank and neutralizes formulas', () => {
    const csv = reviewInsightsCsv([{ ...base, name: '  =HYPERLINK("bad")', average: null, status: 'draft' }], {});
    expect(csv).toContain('"\'  =HYPERLINK(""bad"")"');
    expect(csv).toContain('"3";"1";"2";"2";"";');
    expect(csv).not.toContain('https://hondaanzee.be/');
    expect(csv).not.toContain('member_id');
  });
});
