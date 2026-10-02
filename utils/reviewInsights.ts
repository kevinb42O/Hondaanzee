export type ReviewInsightPlace = {
  place_id: string; kind: 'hotspot' | 'offleash'; city_slug: string; place_slug: string;
  name: string; image: string; status: 'published' | 'draft' | 'archived';
  like_count: number; excluded_like_count: number; recent7_like_count: number; recent30_like_count: number;
  review_count: number; published_count: number; pending_count: number; attention_count: number;
  average: number | null; last_like_at: string | null; last_review_at: string | null; last_activity_at: string | null;
};
export type ReviewInsights = {
  generated_at: string;
  summary: Pick<ReviewInsightPlace, 'like_count' | 'excluded_like_count' | 'recent7_like_count' | 'recent30_like_count' | 'review_count' | 'published_count' | 'attention_count'>;
  places: ReviewInsightPlace[];
};
export const reviewInsightMetrics = { like_count: 'Meeste likes', review_count: 'Meeste reviews', attention_count: 'Te beoordelen', recent7_like_count: 'Likes in 7 dagen', recent30_like_count: 'Likes in 30 dagen', last_activity_at: 'Laatste bijdrage' };
export type ReviewInsightMetric = keyof typeof reviewInsightMetrics;
export const reviewPlacePath = (id: string, filter = 'all') => `/admin/reviews?${new URLSearchParams({ zone: id, filter })}`;
export const reviewInsightsPath = (id?: string) => `/admin/reviews?${new URLSearchParams({ view: 'insights', ...(id ? { place: id } : {}) })}`;
export const reviewInsightAdminPath = (p: ReviewInsightPlace) => `/admin/${p.kind === 'hotspot' ? 'zaken' : 'losloopzones'}/${p.place_id}`;
export const reviewInsightPublicPath = (p: ReviewInsightPlace) => p.status !== 'published' ? null : p.kind === 'hotspot' ? `/${p.city_slug}/hotspots/${p.place_slug}` : `/losloopzones/${p.place_slug}`;
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl');
export function filterReviewInsightPlaces(places: ReviewInsightPlace[], filters: { query: string; city: string; kind: string; metric: ReviewInsightMetric; includeEmpty: boolean; selected: string }, cities: Record<string, string>) {
  const term = normalize(filters.query.trim());
  const value = (p: ReviewInsightPlace) => filters.metric === 'last_activity_at' ? p.last_activity_at ? Date.parse(p.last_activity_at) : 0 : p[filters.metric];
  return places.filter(p => (!filters.selected || p.place_id === filters.selected) && (!filters.city || p.city_slug === filters.city) && (!filters.kind || p.kind === filters.kind) &&
    (filters.includeEmpty || p.like_count + p.excluded_like_count + p.review_count > 0) && (!term || normalize(`${p.name} ${p.place_slug} ${cities[p.city_slug] || p.city_slug}`).includes(term)))
    .sort((a, b) => value(b) - value(a) || b.like_count - a.like_count || b.review_count - a.review_count || a.name.localeCompare(b.name, 'nl') || a.place_id.localeCompare(b.place_id));
}
export function reviewInsightsCsv(places: ReviewInsightPlace[], cities: Record<string, string>) {
  const cell = (value: unknown) => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`; };
  const rows = [['Plek', 'Soort', 'Gemeente', 'Status', 'Huidige likes', 'Uitgesloten likes', 'Likes in 7 dagen (nog aanwezig)', 'Likes in 30 dagen (nog aanwezig)', 'Reviews alle statussen', 'Goedgekeurd (scorebijdragen)', 'Nieuwe inzendingen of wijzigingen', 'Te beoordelen', 'Gemiddelde goedgekeurde sterren', 'Laatste huidige like (UTC)', 'Laatste auteurinzending (UTC)', 'Publieke pagina'],
    ...places.map(p => [p.name, p.kind === 'hotspot' ? 'Hotspot' : 'Losloopzone', cities[p.city_slug] || p.city_slug, p.status, p.like_count, p.excluded_like_count, p.recent7_like_count, p.recent30_like_count, p.review_count, p.published_count, p.pending_count, p.attention_count, p.average, p.last_like_at, p.last_review_at, reviewInsightPublicPath(p) ? `https://hondaanzee.be${reviewInsightPublicPath(p)}` : ''])];
  return '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n');
}
