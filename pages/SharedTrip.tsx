import React, { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Compass, Loader2, LockKeyhole, Waves } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient.ts';
import type { SavedPlace } from '../utils/memberData.ts';
import { SavedPlaceCard, memberDate } from '../components/member/MemberUI.tsx';
import { useSEO } from '../utils/seo.ts';

type SharedCollection = { title: string; trip_date: string | null; places: SavedPlace[] };
export default function SharedTrip() {
  const { token } = useParams();
  const [trip, setTrip] = useState<SharedCollection | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useSEO({ title: trip ? `${trip.title} | Uitstap aan zee` : 'Een gedeelde uitstap | Hond aan Zee', description: 'Een persoonlijke verzameling plekken voor een fijne uitstap aan de Belgische kust.', canonical: `https://hondaanzee.be/uitstap/${token || ''}`, noindex: true });
  useEffect(() => {
    let active = true; setLoading(true); setError(false);
    if (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) { setTrip(null); setLoading(false); return; }
    void supabase.rpc('read_shared_trip', { p_token: token }).then(({ data, error: readError }) => { if (active) { setTrip(data as SharedCollection | null); setError(Boolean(readError)); setLoading(false); } });
    return () => { active = false; };
  }, [token, retry]);
  if (loading) return <div className="member-loading" role="status"><Loader2 className="animate-spin" size={28} /><p>Een mooi plan komt eraan…</p></div>;
  if (error) return <div className="member-status-page"><Compass size={35} /><h1>We kunnen de uitstap even niet laden.</h1><p>Controleer je verbinding en probeer opnieuw.</p><button className="member-button member-button-primary" onClick={() => setRetry(v => v + 1)}>Probeer opnieuw</button></div>;
  if (!trip) return <div className="member-status-page"><LockKeyhole size={35} /><h1>Deze uitstap wordt niet meer gedeeld.</h1><p>De link is niet geldig of de eigenaar heeft het delen stopgezet.</p><Link to="/hotspots" className="member-button">Ontdek zelf de kust <ArrowRight size={17} /></Link></div>;
  return <div className="member-shared"><div className="member-shared-shell"><p className="member-eyebrow"><Waves size={18} /> EEN PLAN OM TE DELEN</p><h1>{trip.title}</h1><p className="member-shared-intro">{trip.places.length} {trip.places.length === 1 ? 'fijne plek' : 'fijne plekken'} voor een dag op jullie manier.{trip.trip_date && <span className="flex items-center gap-2 mt-3"><CalendarDays size={16} />{memberDate(trip.trip_date)}</span>}</p>{trip.places.length ? <div className="member-place-grid">{trip.places.map(p => <SavedPlaceCard key={`${p.kind}/${p.city_slug}/${p.place_slug}`} place={p} />)}</div> : <p className="member-muted">De eigenaar heeft nog geen plekken toegevoegd aan dit plan.</p>}<div className="member-shared-cta"><div><h2>Jouw eigen dag aan zee?</h2><p>Bewaar je favoriete plekken en maak je eigen plannen met een gratis account.</p></div><Link className="member-button member-button-primary" to="/account?mode=register">Maak mijn account <ArrowRight size={17} /></Link></div></div></div>;
}
