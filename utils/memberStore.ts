import { supabase } from './supabaseClient.ts';

export type SavedPlace = { kind: 'hotspot' | 'service' | 'offleash'; city_slug: string; place_slug: string };
export type Favorite = SavedPlace & { created_at: string };
export type MemberProfile = { id: string; email: string; email_confirmed_at: string | null; display_name: string; home_city: string | null; status: 'active' | 'suspended'; created_at: string; last_active_at: string | null };
export type MemberDog = { id: string; name: string; breed: string; avatar: 'sand' | 'sea' | 'sun' | 'rose' };
export type MemberTrip = { id: string; title: string; trip_date: string | null; note: string; share_token: string | null; created_at: string };
export type TripPlace = SavedPlace & { id: string; trip_id: string; created_at: string };
export type MemberState = { profile: MemberProfile; favorites: Favorite[]; towns: string[]; dogs: MemberDog[]; trips: MemberTrip[]; tripPlaces: TripPlace[] };
export const placeKey = (place: SavedPlace) => `${place.kind}/${place.city_slug}/${place.place_slug}`;
export const safeMemberReturnPath = (value?: string | null): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\s\u0000-\u001f]/.test(value)) return '/account';
  if (value.startsWith('/admin') || value.startsWith('/_meldpunt') || value.startsWith('/account')) return '/account';
  return value;
};
export async function loadMemberState(id: string): Promise<MemberState> {
  const results = await Promise.all([
    supabase.from('member_profiles').select('*').eq('id', id).single(),
    supabase.from('member_favorites').select('kind,city_slug,place_slug,created_at').eq('member_id', id).order('created_at', { ascending: false }),
    supabase.from('member_towns').select('city_slug').eq('member_id', id),
    supabase.from('member_dogs').select('id,name,breed,avatar').eq('member_id', id).order('created_at'),
    supabase.from('member_trips').select('id,title,trip_date,note,share_token,created_at').eq('member_id', id).order('created_at', { ascending: false }),
    supabase.from('member_trip_places').select('id,trip_id,kind,city_slug,place_slug,created_at').order('created_at'),
  ]);
  if (results.some(result => result.error)) throw new Error('Je account kon niet worden geladen. Probeer opnieuw.');
  const [profile, favorites, towns, dogs, trips, tripPlaces] = results;
  return { profile: profile.data as MemberProfile, favorites: favorites.data as Favorite[], towns: towns.data.map(t => t.city_slug), dogs: dogs.data as MemberDog[], trips: trips.data as MemberTrip[], tripPlaces: tripPlaces.data as TripPlace[] };
}
export async function requireMemberMutation(result: { error: { message?: string; code?: string } | null; data?: unknown }) {
  if (result.error) {
    if (result.error.code === '23505') throw new Error('Deze plek staat al in je lijst.');
    throw new Error('Opslaan is niet gelukt. Controleer je verbinding en probeer opnieuw.');
  }
}

const PENDING_SAVE_KEY = 'haz-pending-save-v1';
export function rememberPendingSave(place: SavedPlace) {
  try { localStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({ ...place, at: Date.now() })); } catch { /* Browser storage can be unavailable. */ }
}
export function readPendingSave(): SavedPlace | null {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_SAVE_KEY) || 'null');
    if (!pending || typeof pending.at !== 'number' || Date.now() - pending.at > 86400000 || !['hotspot', 'service', 'offleash'].includes(pending.kind) || typeof pending.city_slug !== 'string' || typeof pending.place_slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pending.city_slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pending.place_slug)) return null;
    return { kind: pending.kind, city_slug: pending.city_slug, place_slug: pending.place_slug };
  } catch { return null; }
}
export function clearPendingSave() { try { localStorage.removeItem(PENDING_SAVE_KEY); } catch { /* Storage unavailable. */ } }
