import React, { Suspense, useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Compass, Heart, LayoutGrid, List, Loader2, Map, MapPin, PawPrint, Search, Settings2, ShieldAlert, Sun, Waves } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CITIES } from '../../cityData.ts';
import { EVENTS } from '../../data/events.ts';
import { evaluateCityRuleStatus } from '../../utils/rules.ts';
import { MEMBER_CATALOG, resolveSavedPlace, type Favorite, type MemberState } from '../../utils/memberData.ts';
import { supabase } from '../../utils/supabaseClient.ts';
import { useMember } from './MemberProvider.tsx';
import { MemberEmpty, SavedPlaceCard } from './MemberUI.tsx';
import MemberTrips from './MemberTrips.tsx';
import MemberSettings from './MemberSettings.tsx';

const FavoriteMap = React.lazy(() => import('./FavoriteMap.tsx'));
const tabs = [{ key: 'overview', label: 'Mijn overzicht', icon: LayoutGrid }, { key: 'favorites', label: 'Mijn favorieten', icon: Heart }, { key: 'trips', label: 'Mijn uitstapjes', icon: Compass }, { key: 'towns', label: 'Mijn kust', icon: Waves }, { key: 'settings', label: 'Mijn profiel', icon: Settings2 }];

export default function MemberDashboard() {
  const member = useMember(), data = member.data!;
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get('tab') || 'overview';
  const tab = tabs.some(t => t.key === requestedTab) ? requestedTab : 'overview';
  const go = (key: string) => setParams(key === 'overview' ? {} : { tab: key });
  const firstName = data.profile.display_name.split(' ')[0];
  return <div className="member-dashboard"><div className="member-dashboard-shell">
    <div className="member-dashboard-heading"><div><p className="member-eyebrow"><Waves size={17} /> MIJN HOND AAN ZEE</p><h1>{firstName ? `Dag ${firstName}.` : 'Welkom aan zee.'}<span> Dit is jouw kust.</span></h1></div><Link className="member-discover-link" to="/kaart">Ga op ontdekking <ArrowRight size={17} /></Link></div>
    <nav className="member-dashboard-nav" aria-label="Mijn account">{tabs.map(({ key, label, icon: Icon }) => <button type="button" key={key} className={tab === key ? 'is-active' : ''} aria-current={tab === key ? 'page' : undefined} onClick={() => go(key)}><Icon size={17} /><span>{label}</span>{key === 'favorites' && data.favorites.length > 0 && <small>{data.favorites.length}</small>}</button>)}</nav>
    {member.error && <p className="member-error" role="alert">{member.error}<button className="member-text-button" onClick={() => void member.refresh()}>Opnieuw laden</button></p>}
    <div className="member-tab-content" key={tab}>
      {tab === 'overview' && <Overview data={data} go={go} />}
      {tab === 'favorites' && <Favorites favorites={data.favorites} />}
      {tab === 'trips' && <MemberTrips />}
      {tab === 'towns' && <Towns />}
      {tab === 'settings' && <MemberSettings />}
    </div>
    <div className="member-dashboard-signoff"><PawPrint size={17} /><span>Meer fijne plekken. Meer frisse lucht. Meer samen.</span></div>
  </div></div>;
}

function Overview({ data, go }: { data: MemberState; go: (key: string) => void }) {
  const followed = CITIES.filter(c => data.towns.includes(c.slug));
  const recommendations = MEMBER_CATALOG.filter(p => (!followed.length || data.towns.includes(p.city_slug)) && !data.favorites.some(f => f.kind === p.kind && f.city_slug === p.city_slug && f.place_slug === p.place_slug)).slice(0, 3);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const events = EVENTS.filter(e => e.date >= today && (!followed.length || data.towns.includes(e.citySlug))).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  return <>
    <section className="member-adventure-banner"><div><span className="member-banner-label"><Sun size={16} />ER IS ALTIJD EEN REDEN OM UIT TE WAAIEN</span><h2>Een dag aan zee.<br /><em>Op jullie manier.</em></h2><p>{data.dogs.length ? `Met ${data.dogs.map(d => d.name).join(' & ')} erbij wordt elk plan een goed plan.` : 'Van dat ene terrasje tot een lange wandeling. Bewaar wat jullie blij maakt.'}</p><button className="member-button" onClick={() => go('trips')}>Plan jullie volgende uitstap <ArrowRight size={17} /></button></div><div className="member-banner-image"><img src="/happy-dog-strand.webp" alt="Een blije hond op het strand" /><div className="member-banner-sticker"><PawPrint size={24} /><span>zandpoten<br /><strong>welkom</strong></span></div></div></section>
    <div className="member-quick-stats">{[{ key: 'favorites', count: data.favorites.length, title: 'fijne plekken bewaard', icon: Heart, tone: 'rose' }, { key: 'trips', count: data.trips.length, title: 'uitstapjes in het verschiet', icon: Compass, tone: 'sand' }, { key: 'towns', count: data.towns.length, title: 'gemeenten op jouw radar', icon: Waves, tone: 'sea' }].map(({ key, count, title, icon: Icon, tone }) => <button key={key} onClick={() => go(key)}><span className={`member-stat-icon dog-${tone}`}><Icon size={21} /></span><span><strong>{count}</strong><small>{title}</small></span><ArrowRight size={16} /></button>)}</div>
    {!data.profile.display_name && <div className="member-personalise"><span className="member-dog-avatar dog-sand"><PawPrint size={25} /></span><div><strong>Een ereplek voor jou en je hond.</strong><p>Voeg je naam en je viervoeter toe. Dan voelt jouw kust nog meer als thuis.</p></div><button className="member-button member-button-small" onClick={() => go('settings')}>Maak het persoonlijk <ArrowRight size={15} /></button></div>}
    <div className="member-section-heading"><div><p className="member-eyebrow">{data.favorites.length ? 'BEWAARD VOOR LATER' : 'EEN PAAR FIJNE BEGINPUNTEN'}</p><h2>{data.favorites.length ? 'Plekjes om naar terug te keren.' : 'Waar begint jullie volgende dag?'}</h2></div><button className="member-text-button" onClick={() => go('favorites')}>Mijn favorieten <ArrowRight size={16} /></button></div>
    <div className="member-place-grid">{(data.favorites.length ? data.favorites.slice(0, 3) : recommendations).map(p => <SavedPlaceCard key={`${p.kind}/${p.city_slug}/${p.place_slug}`} place={p} />)}</div>
    <div className="member-overview-columns"><section className="member-panel"><div className="member-editor-heading"><h3>Jouw kust, vandaag.</h3><button className="member-text-button" onClick={() => go('towns')}>Kies gemeenten <ArrowRight size={15} /></button></div>{followed.length ? <div className="member-town-summary">{followed.slice(0, 3).map(city => { const rule = evaluateCityRuleStatus(city); return <Link to={`/${city.slug}`} key={city.slug}><img src={city.image} alt="" /><span><strong>{city.name}</strong><small>{rule.label}</small></span><span className={`member-rule-pill rule-${rule.status}`}>{rule.status === 'JA' ? 'Toegelaten' : rule.status === 'DEELS' ? 'Beperkt' : 'Verboden'}</span></Link>; })}</div> : <div className="member-inline-empty"><Waves size={28} /><p>Volg de gemeenten waar je graag komt. Hun strandregels vind je dan hier terug.</p><button className="member-button member-button-small" onClick={() => go('towns')}>Kies jouw kust</button></div>}</section><section className="member-panel member-agenda-panel"><div className="member-editor-heading"><h3><CalendarDays size={19} />Iets leuks op de agenda?</h3><Link className="member-text-button" to="/agenda">Bekijk agenda <ArrowRight size={15} /></Link></div>{events.length ? events.map(event => <Link className="member-event-row" to={`/agenda/${event.slug}`} key={event.slug}><img src={event.image} alt="" /><span><strong>{event.title}</strong><small>{event.dateDisplay} · {event.cityName}</small></span><ArrowRight size={16} /></Link>) : <div className="member-inline-empty"><CalendarDays size={28} /><p>Er staan nog geen komende evenementen voor jouw selectie in de agenda. Nieuwe plannen vind je in onze kustgids.</p><Link className="member-button member-button-small" to="/hotspots">Ontdek fijne plekken</Link></div>}</section></div>
    {followed.length > 0 && <TownReports towns={data.towns} />}
  </>;
}

function Favorites({ favorites }: { favorites: Favorite[] }) {
  const [search, setSearch] = useState(''), [kind, setKind] = useState('all'), [view, setView] = useState('grid');
  const matches = favorites.filter(p => { const place = resolveSavedPlace(p); return (kind === 'all' || p.kind === kind) && (!search || place && `${place.name} ${place.cityName} ${place.category}`.toLowerCase().includes(search.toLowerCase())); });
  return <>
    <div className="member-section-heading"><div><p className="member-eyebrow">JOUW VERZAMELING FIJNE PLEKKEN</p><h2>Hier wil je nog eens naartoe.</h2><p>Een hartje vandaag, een goed idee voor later.</p></div><Link className="member-button" to="/hotspots">Ontdek meer plekken <ArrowRight size={16} /></Link></div>
    {favorites.length > 0 ? <><div className="member-favorite-toolbar"><label className="member-search"><Search size={18} /><input type="search" aria-label="Zoek je favorieten" placeholder="Zoek een plek of gemeente" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Filter favorieten op soort" value={kind} onChange={e => setKind(e.target.value)}><option value="all">Alle plekken</option><option value="hotspot">Hotspots</option><option value="service">Diensten</option><option value="offleash">Losloopzones</option></select><div className="member-view-switch"><button type="button" aria-label="Toon favorieten als kaarten" aria-pressed={view === 'grid'} className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><LayoutGrid size={18} /></button><button type="button" aria-label="Toon favorieten op de kaart" aria-pressed={view === 'map'} className={view === 'map' ? 'is-active' : ''} onClick={() => setView('map')}><Map size={18} /></button></div></div>{matches.length ? view === 'map' ? <Suspense fallback={<div className="member-inline-empty"><Loader2 className="animate-spin" /><p>Kaart laden…</p></div>}><FavoriteMap places={matches} /></Suspense> : <div className="member-place-grid">{matches.map(p => <SavedPlaceCard key={`${p.kind}/${p.city_slug}/${p.place_slug}`} place={p} />)}</div> : <MemberEmpty title="Geen plekjes met deze zoekopdracht." text="Probeer een andere naam of toon je hele verzameling."><button className="member-button" onClick={() => { setSearch(''); setKind('all'); }}>Wis de filters</button></MemberEmpty>}</> : <><MemberEmpty title="Een hartje is het begin." text="Zie je een fijn terrasje, een losloopzone of een plek om te blijven slapen? Tik op het hartje. Je vindt ze hier allemaal terug."><Link className="member-button member-button-primary" to="/hotspots">Vind je eerste favoriet <ArrowRight size={17} /></Link></MemberEmpty><div className="member-section-heading"><h3>Een beetje inspiratie voor jullie.</h3></div><div className="member-place-grid">{MEMBER_CATALOG.slice(0, 3).map(p => <SavedPlaceCard key={p.key} place={p} />)}</div></>}
  </>;
}

function Towns() {
  const member = useMember(), towns = member.data!.towns;
  const [busy, setBusy] = useState<string | null>(null);
  return <><div className="member-section-heading"><div><p className="member-eyebrow">VAN DE PANNE TOT KNOKKE-HEIST</p><h2>Welke kust voelt als de jouwe?</h2><p>Volg je favoriete gemeenten en vind hun actuele strandregels in je overzicht.</p></div><span className="member-count-pill">{towns.length} gevolgd</span></div><div className="member-towns-grid">{CITIES.map(city => {
    const followed = towns.includes(city.slug), rule = evaluateCityRuleStatus(city);
    return <article className={`member-town-card ${followed ? 'is-followed' : ''}`} key={city.slug}><Link to={`/${city.slug}`} className="member-town-image" tabIndex={-1} aria-hidden="true"><img src={city.image} alt="" loading="lazy" /><span className={`member-rule-pill rule-${rule.status}`}>{rule.status === 'JA' ? 'Honden toegelaten' : rule.status === 'DEELS' ? 'Beperkt toegelaten' : 'Honden verboden'}</span></Link><div><h3><Link to={`/${city.slug}`}>{city.name}</Link></h3><p>{rule.label}</p><div className="member-town-bottom"><Link to={`/${city.slug}`}>Bekijk de regels <ArrowRight size={14} /></Link><button className={`member-follow-button ${followed ? 'is-active' : ''}`} disabled={busy !== null} aria-pressed={followed} aria-label={`${followed ? 'Ontvolg' : 'Volg'} ${city.name}`} onClick={async () => { setBusy(city.slug); try { await member.toggleTown(city.slug); } catch (cause) { member.notify(cause instanceof Error ? cause.message : 'Volgen lukte niet.'); } finally { setBusy(null); } }}>{busy === city.slug ? <Loader2 size={15} className="animate-spin" /> : followed ? <Check size={15} /> : <PlusIcon />}{followed ? 'Gevolgd' : 'Volgen'}</button></div></div></article>;
  })}</div><p className="member-small-note"><ShieldAlert size={15} />Dit is een samenvatting. Bekijk steeds de volledige strandregels en de borden ter plaatse.</p><TownReports towns={towns} /></>;
}
function PlusIcon() { return <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 0.7 }}>+</span>; }

function TownReports({ towns }: { towns: string[] }) {
  const [reports, setReports] = useState<{ public_id: string; city_slug: string; category: string; location_text: string }[]>([]);
  const [loading, setLoading] = useState(false), [error, setError] = useState(false);
  const key = [...towns].sort().join(',');
  useEffect(() => {
    let active = true;
    if (!towns.length) { setReports([]); return; }
    setLoading(true); setError(false);
    void supabase.from('reports').select('public_id,city_slug,category,location_text').in('city_slug', towns).eq('status', 'published').eq('is_hidden', false).is('resolved_at', null).order('observed_at', { ascending: false }).limit(3).then(({ data, error: loadError }) => { if (active) { setReports(data || []); setError(Boolean(loadError)); setLoading(false); } });
    return () => { active = false; };
  }, [key]);
  if (!towns.length) return null;
  return <section className="member-panel member-reports-panel"><div className="member-editor-heading"><h3><ShieldAlert size={19} />Meldpunt in jouw gemeenten</h3><Link className="member-text-button" to="/meldpunt">Bekijk meldpunt <ArrowRight size={15} /></Link></div>{loading ? <p className="member-muted" role="status">Meldingen laden…</p> : error ? <p className="member-muted">Meldingen konden niet worden geladen. Bekijk het meldpunt voor de actuele informatie.</p> : reports.length ? <div className="member-report-list">{reports.map(report => <Link to={`/meldpunt/${report.public_id}`} key={report.public_id}><span className="member-report-dot" /><span><strong>{CITIES.find(c => c.slug === report.city_slug)?.name}</strong><small>{report.location_text}</small></span><ArrowRight size={16} /></Link>)}</div> : <p className="member-muted">Er zijn momenteel geen zichtbare, onopgeloste meldingen voor je gevolgde gemeenten. Raadpleeg het meldpunt voor alle informatie.</p>}</section>;
}
