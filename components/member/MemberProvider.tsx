import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabaseClient.ts';
import { clearPendingSave, loadMemberState, placeKey, readPendingSave, requireMemberMutation, type MemberState, type SavedPlace } from '../../utils/memberStore.ts';

type MemberContextValue = { session: Session | null; sessionLoading: boolean; loading: boolean; data: MemberState | null; error: string | null; notice: string | null; refresh: () => Promise<void>; toggleFavorite: (place: SavedPlace) => Promise<void>; toggleTown: (slug: string) => Promise<void>; signOut: () => Promise<void>; notify: (message: string) => void };
const fallback: MemberContextValue = { session: null, sessionLoading: false, loading: false, data: null, error: null, notice: null, refresh: async () => {}, toggleFavorite: async () => {}, toggleTown: async () => {}, signOut: async () => {}, notify: () => {} };
const MemberContext = createContext<MemberContextValue>(fallback);
export const useMember = () => useContext(MemberContext);

export default function MemberProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MemberState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const currentId = useRef<string | null>(null);
  const version = useRef(0);
  const savingPending = useRef(false);
  const mutationLocks = useRef(new Set<string>());
  const notify = useCallback((message: string) => setNotice(message), []);
  useEffect(() => { if (notice) { const timer = window.setTimeout(() => setNotice(null), 6000); return () => clearTimeout(timer); } }, [notice]);

  useEffect(() => {
    let active = true;
    let authEvents = 0;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      authEvents++;
      if (active) { setSession(next); setSessionLoading(false); }
    });
    const seen = authEvents;
    void supabase.auth.getSession().then(({ data: result, error: authError }) => {
      if (active && seen === authEvents) {
        setSession(result.session); setSessionLoading(false);
        if (authError) setError('Je sessie kon niet worden hersteld. Log opnieuw in.');
      }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const refresh = useCallback(async () => {
    const id = currentId.current;
    const requestVersion = ++version.current;
    if (!id) { setData(null); setError(null); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const next = await loadMemberState(id);
      if (currentId.current === id && requestVersion === version.current) setData(next);
    } catch (cause) {
      if (currentId.current === id && requestVersion === version.current) setError(cause instanceof Error ? cause.message : 'Je account kon niet worden geladen.');
    } finally { if (requestVersion === version.current) setLoading(false); }
  }, []);

  const id = session?.user.id ?? null;
  useEffect(() => {
    currentId.current = id; version.current++; setData(null); setNotice(null);
    void refresh();
    return () => { version.current++; };
  }, [id, refresh]);

  useEffect(() => {
    if (data?.profile.status === 'active') void supabase.rpc('record_member_visit').then(() => {});
  }, [data?.profile.id, data?.profile.status]);

  useEffect(() => {
    if (!data || data.profile.status !== 'active' || savingPending.current) return;
    const pending = readPendingSave();
    if (!pending) return;
    if (data.favorites.some(p => placeKey(p) === placeKey(pending))) { clearPendingSave(); return; }
    savingPending.current = true;
    const owner = data.profile.id;
    void (async () => {
      try {
        const result = await supabase.from('member_favorites').insert({ ...pending, member_id: owner });
        if (result.error?.code !== '23505') await requireMemberMutation(result);
        if (currentId.current !== owner) return;
        clearPendingSave(); await refresh(); notify('Je eerste plek is bewaard. Welkom aan zee!');
      } catch { if (currentId.current === owner) notify('Je plek is nog niet bewaard. Probeer het hartje opnieuw.'); }
      finally { savingPending.current = false; }
    })();
  }, [data, refresh, notify]);

  const toggleFavorite = useCallback(async (place: SavedPlace) => {
    if (!data || data.profile.status !== 'active') throw new Error('Log in om je plekken te bewaren.');
    const owner = data.profile.id, key = placeKey(place);
    if (mutationLocks.current.has(key)) return;
    mutationLocks.current.add(key);
    try {
      const saved = data.favorites.some(p => placeKey(p) === key);
      const result = saved ? await supabase.from('member_favorites').delete().eq('member_id', owner).eq('kind', place.kind).eq('city_slug', place.city_slug).eq('place_slug', place.place_slug)
        : await supabase.from('member_favorites').insert({ ...place, member_id: owner });
      await requireMemberMutation(result);
      if (currentId.current === owner) { await refresh(); notify(saved ? 'Plek uit je favorieten gehaald.' : 'Bewaard voor je volgende uitstap.'); }
    } finally { mutationLocks.current.delete(key); }
  }, [data, refresh, notify]);

  const toggleTown = useCallback(async (slug: string) => {
    if (!data || data.profile.status !== 'active') throw new Error('Log in om een gemeente te volgen.');
    const owner = data.profile.id, key = `town/${slug}`;
    if (mutationLocks.current.has(key)) return;
    mutationLocks.current.add(key);
    try {
      const followed = data.towns.includes(slug);
      const result = followed ? await supabase.from('member_towns').delete().eq('member_id', owner).eq('city_slug', slug)
        : await supabase.from('member_towns').insert({ member_id: owner, city_slug: slug });
      await requireMemberMutation(result);
      if (currentId.current === owner) { await refresh(); notify(followed ? 'Gemeente ontvolgd.' : 'Gemeente toegevoegd aan jouw kust.'); }
    } finally { mutationLocks.current.delete(key); }
  }, [data, refresh, notify]);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw new Error('Uitloggen lukte niet. Probeer opnieuw.');
    clearPendingSave();
  }, []);

  return <MemberContext.Provider value={{ session, sessionLoading, data, loading, error, notice, refresh, toggleFavorite, toggleTown, signOut, notify }}>{children}
    {notice && <div className="member-toast" role="status" aria-live="polite"><span>✓</span>{notice}<button type="button" onClick={() => setNotice(null)} aria-label="Melding sluiten">×</button></div>}
  </MemberContext.Provider>;
}
