import type { PlaceKind } from './placeRoutes.ts';

export type FavoriteMetric = 'saved_count' | 'recent7_count' | 'recent30_count';
export type FavoritePlace = {
  place_id: string | null; kind: PlaceKind | 'offleash'; city_slug: string; place_slug: string;
  name: string; type: string; image: string; status: 'published' | 'draft' | 'archived' | 'unlinked';
  temporarily_closed: boolean; saved_count: number; recent7_count: number; recent30_count: number; last_saved_at: string | null;
};
export type FavoriteInsights = {
  generated_at: string;
  summary: { saved_count: number; member_count: number; account_count: number; place_count: number; recent7_count: number; recent30_count: number; unavailable_count: number };
  places: FavoritePlace[];
  cities: { city_slug: string; saved_count: number; member_count: number }[];
};
export const favoriteKindLabels = { hotspot: 'Hotspots', service: 'Diensten', offleash: 'Losloopzones' };
export const favoriteStatusLabels = { published: 'Gepubliceerd', draft: 'Concept', archived: 'Gearchiveerd', unlinked: 'Niet meer gekoppeld' };
export const favoriteMetricLabels = { saved_count: 'Totaal bewaard', recent7_count: 'Toegevoegd in 7 dagen', recent30_count: 'Toegevoegd in 30 dagen' };
export const favoriteKey = (place: FavoritePlace) => [place.kind, place.city_slug, place.place_slug].join('/');
export const favoriteAdminPath = (place: FavoritePlace) => place.place_id ? `/admin/${place.kind === 'offleash' ? 'losloopzones' : 'zaken'}/${place.place_id}` : null;
export const favoritePublicPath = (place: FavoritePlace) => place.status !== 'published' ? null : place.kind === 'offleash' ? `/losloopzones/${place.place_slug}` : `/${place.city_slug}/${place.kind === 'hotspot' ? 'hotspots' : 'diensten'}/${place.place_slug}`;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl');
export function filterFavoritePlaces(places: FavoritePlace[], filters: { query: string; city: string; kind: string; status: string; metric: FavoriteMetric; includeEmpty: boolean }, cities: Record<string, string>) {
  const term = normalize(filters.query.trim());
  return places.filter(place => (!filters.city || place.city_slug === filters.city) && (!filters.kind || place.kind === filters.kind) &&
    (!filters.status || (filters.status === 'unavailable' ? place.status !== 'published' : place.status === filters.status)) &&
    (filters.includeEmpty || place[filters.metric] > 0) && (!term || normalize(`${place.name} ${place.place_slug} ${place.type} ${cities[place.city_slug] || place.city_slug}`).includes(term)))
    .sort((a, b) => b[filters.metric] - a[filters.metric] || b.saved_count - a.saved_count || a.name.localeCompare(b.name, 'nl') || favoriteKey(a).localeCompare(favoriteKey(b)));
}
// Escape cells that spreadsheet software could interpret as executable formulas.
export function favoriteCsv(places: FavoritePlace[], cities: Record<string, string>) {
  const cell = (value: unknown) => { let text = String(value ?? ''); if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
  const rows = [['Plek', 'Soort', 'Gemeente', 'Status', 'Huidige favorieten', 'Toegevoegd laatste 7 dagen (nog bewaard)', 'Toegevoegd laatste 30 dagen (nog bewaard)', 'Laatste huidige favoriet (UTC)', 'Publieke pagina'],
    ...places.map(p => [p.name, favoriteKindLabels[p.kind], cities[p.city_slug] || p.city_slug, favoriteStatusLabels[p.status], p.saved_count, p.recent7_count, p.recent30_count, p.last_saved_at || '', favoritePublicPath(p) ? `https://hondaanzee.be${favoritePublicPath(p)}` : ''])];
  return '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n');
}
