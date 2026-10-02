import React, { useState } from 'react';
import { ArrowRight, CalendarDays, Check, Compass, Copy, Link2, Loader2, LockKeyhole, MapPin, Plus, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMember } from './MemberProvider.tsx';
import { MemberDialog, MemberEmpty, memberDate } from './MemberUI.tsx';
import { MEMBER_CATALOG, placeKey, requireMemberMutation, resolveSavedPlace, type MemberTrip, type SavedPlace } from '../../utils/memberData.ts';
import { supabase } from '../../utils/supabaseClient.ts';

export default function MemberTrips() {
  const member = useMember();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const data = member.data!;
  const trip = data.trips.find(t => t.id === selected);
  return <>
    <div className="member-section-heading"><div><p className="member-eyebrow">VAN IDEE NAAR UITWAAIEN</p><h2>Jullie volgende avontuur.</h2><p>Verzamel fijne plekken voor een dagje of een heel weekend.</p></div><button className="member-button member-button-primary" onClick={() => { setTitle(''); setError(null); setCreating(true); }}><Plus size={18} />Nieuwe uitstap</button></div>
    {data.trips.length ? <div className="member-trip-grid">{data.trips.map((item, index) => {
      const places = data.tripPlaces.filter(p => p.trip_id === item.id);
      const cover = places.map(resolveSavedPlace).find(Boolean);
      return <button className={`member-trip-card member-trip-tone-${index % 3}`} key={item.id} onClick={() => setSelected(item.id)}>
        <div className="member-trip-cover">{cover ? <img src={cover.image} alt="" loading="lazy" /> : <><Compass size={72} strokeWidth={1} /><span>Er ligt iets moois in het verschiet.</span></>}<span className="member-trip-privacy">{item.share_token ? <Link2 size={13} /> : <LockKeyhole size={13} />}{item.share_token ? 'Deelbaar via link' : 'Alleen voor jou'}</span></div>
        <div className="member-trip-copy"><span>{places.length} {places.length === 1 ? 'plek' : 'plekken'}{item.trip_date && ` · ${memberDate(item.trip_date)}`}</span><h3>{item.title}</h3><p>{item.note || 'Een beetje plannen, een heleboel genieten.'}</p><span className="member-trip-open">Bekijk je uitstap <ArrowRight size={17} /></span></div>
      </button>;
    })}</div> : <MemberEmpty icon="map" title="Een plan begint met een fijne plek." text="Een wandeling, een terrasje, misschien een nachtje weg. Maak je eerste uitstap en zet alles bij elkaar."><button className="member-button" onClick={() => setCreating(true)}><Plus size={17} />Maak je eerste uitstap</button></MemberEmpty>}
    {creating && <MemberDialog title="Een nieuw plan voor aan zee" onClose={() => !busy && setCreating(false)}><form className="member-dialog-body" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError(null);
      try {
        const result = await supabase.from('member_trips').insert({ member_id: data.profile.id, title: title.trim() }).select('id').single();
        await requireMemberMutation(result); await member.refresh(); setCreating(false); setSelected(result.data!.id); member.notify('Je uitstap staat klaar. Tijd om plekken te kiezen.');
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Aanmaken lukte niet.'); } finally { setBusy(false); }
    }}><p>Geef jullie uitstap een naam. De fijne plekken voeg je zo toe.</p><label className="member-field">Naam van je uitstap<input name="trip-title" placeholder="Bijvoorbeeld: Weekend in De Haan" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} required autoFocus /></label>{error && <p className="member-error" role="alert">{error}</p>}<button className="member-button member-button-primary" disabled={busy || !title.trim()}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}Maak mijn uitstap</button></form></MemberDialog>}
    {trip && <TripEditor key={trip.id} trip={trip} onClose={() => setSelected(null)} />}
  </>;
}

function TripEditor({ trip, onClose }: { trip: MemberTrip; onClose: () => void }) {
  const member = useMember(), data = member.data!;
  const [title, setTitle] = useState(trip.title);
  const [date, setDate] = useState(trip.trip_date || '');
  const [note, setNote] = useState(trip.note);
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const places = data.tripPlaces.filter(p => p.trip_id === trip.id);
  const currentKeys = new Set(places.map(placeKey));
  const favoriteKeys = new Set(data.favorites.map(placeKey));
  const matches = MEMBER_CATALOG.filter(p => !currentKeys.has(p.key) && (!favoritesOnly || favoriteKeys.has(p.key)) && `${p.name} ${p.cityName} ${p.category}`.toLowerCase().includes(search.toLowerCase())).slice(0, 30);
  const shareUrl = trip.share_token ? `${window.location.origin}/uitstap/${trip.share_token}` : '';
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await action(); await member.refresh(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : 'De wijziging kon niet worden opgeslagen.'); return false; } finally { setBusy(false); }
  };
  const addPlace = (place: SavedPlace) => run(async () => {
    await requireMemberMutation(await supabase.from('member_trip_places').insert({ trip_id: trip.id, kind: place.kind, city_slug: place.city_slug, place_slug: place.place_slug }).select('id').single());
    member.notify('Plek toegevoegd aan je uitstap.');
  });

  return <MemberDialog title="Jouw uitstap" onClose={() => !busy && onClose()} wide><div className="member-dialog-body">
    <form onSubmit={async e => { e.preventDefault(); if (await run(async () => { await requireMemberMutation(await supabase.from('member_trips').update({ title: title.trim(), trip_date: date || null, note }).eq('id', trip.id).select('id').single()); })) member.notify('Je uitstap is bijgewerkt.'); }}>
      <div className="member-form-columns"><label className="member-field">Naam<input name="trip-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} required /></label><label className="member-field">Datum <span>optioneel</span><input type="date" name="trip-date" value={date} onChange={e => setDate(e.target.value)} /></label></div>
      <label className="member-field">Een notitie voor jezelf <span>blijft privé</span><textarea name="trip-note" value={note} onChange={e => setNote(e.target.value)} maxLength={2000} rows={2} placeholder="Wat willen jullie zeker doen?" /></label>
      <button className="member-button member-button-small" disabled={busy || !title.trim()}><Check size={16} />Wijzigingen bewaren</button>
    </form>
    <div className="member-editor-heading"><h3>De plekken op jullie plan <span>{places.length}</span></h3><button className="member-text-button" type="button" onClick={() => setAdding(v => !v)}>{adding ? <X size={16} /> : <Plus size={16} />}{adding ? 'Sluit plekkeuze' : 'Plek toevoegen'}</button></div>
    {places.length ? <div className="member-trip-place-list">{places.map((p, index) => {
      const resolved = resolveSavedPlace(p);
      return <div key={p.id}><span className="member-stop-number">{String(index + 1).padStart(2, '0')}</span>{resolved && <img src={resolved.image} alt="" />}<span>{resolved ? <Link to={resolved.path} onClick={onClose}>{resolved.name}</Link> : <strong>Plek niet meer beschikbaar</strong>}<small>{resolved?.cityName} {resolved && `· ${resolved.category}`}</small></span><button className="member-icon-button" type="button" disabled={busy} aria-label={`Verwijder ${resolved?.name || 'plek'} uit uitstap`} onClick={() => void run(async () => { await requireMemberMutation(await supabase.from('member_trip_places').delete().eq('id', p.id)); })}><X size={17} /></button></div>;
    })}</div> : !adding && <div className="member-inline-empty"><MapPin size={23} /><p>Voeg een eerste plek toe en je plan krijgt vorm.</p><button className="member-button member-button-small" onClick={() => setAdding(true)}><Plus size={15} />Kies een plek</button></div>}
    {adding && <div className="member-place-picker"><div className="member-picker-toolbar"><label className="member-search"><Search size={17} /><input type="search" aria-label="Zoek plekken voor je uitstap" placeholder="Zoek een plek of gemeente" value={search} onChange={e => setSearch(e.target.value)} /></label><label className="member-checkbox"><input type="checkbox" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)} />Mijn favorieten</label></div><div className="member-picker-list">{matches.map(place => <div key={place.key}><img src={place.image} alt="" loading="lazy" /><span><strong>{place.name}</strong><small>{place.cityName} · {place.category}</small></span><button className="member-icon-button" disabled={busy} aria-label={`Voeg ${place.name} toe aan uitstap`} onClick={() => void addPlace(place)}><Plus size={19} /></button></div>)}{!matches.length && <p className="member-muted">{favoritesOnly ? 'Geen passende favorieten. Vink “Mijn favorieten” uit om de hele gids te bekijken.' : 'Geen plekken gevonden. Probeer een andere zoekterm.'}</p>}</div></div>}
    <div className="member-share-box"><div><Link2 size={20} /><span><strong>Samen plannen is leuker.</strong><small>Je link toont de plekken en datum. Je persoonlijke notitie blijft privé.</small></span></div>{shareUrl ? <>
      <label className="member-field">Deelbare link<input aria-label="Deelbare uitstaplink" value={shareUrl} readOnly onFocus={e => e.target.select()} /></label>
      <div className="member-button-row"><button className="member-button member-button-small" type="button" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); } catch { setError('Kopiëren lukt hier niet. Selecteer de link hierboven en kopieer hem zelf.'); } }}><Copy size={15} />{copied ? 'Link gekopieerd' : 'Kopieer link'}</button><button className="member-text-button" disabled={busy} onClick={() => void run(async () => { await requireMemberMutation(await supabase.from('member_trips').update({ share_token: null }).eq('id', trip.id).select('id').single()); setCopied(false); })}><LockKeyhole size={14} />Stop delen</button></div>
    </> : <button className="member-button member-button-small" disabled={busy} onClick={() => void run(async () => { await requireMemberMutation(await supabase.from('member_trips').update({ share_token: crypto.randomUUID() }).eq('id', trip.id).select('id').single()); })}><Link2 size={15} />Maak een deelbare link</button>}</div>
    {error && <p className="member-error" role="alert">{error}</p>}
    <div className="member-editor-footer">{deleting ? <><span>Deze uitstap en de deelbare link verdwijnen.</span><button className="member-button member-button-danger member-button-small" disabled={busy} onClick={async () => { if (await run(async () => { await requireMemberMutation(await supabase.from('member_trips').delete().eq('id', trip.id)); })) onClose(); }}>Ja, verwijder uitstap</button><button className="member-text-button" disabled={busy} onClick={() => setDeleting(false)}>Annuleren</button></> : <button className="member-text-button member-danger-text" onClick={() => setDeleting(true)}><Trash2 size={15} />Uitstap verwijderen</button>}</div>
  </div></MemberDialog>;
}
