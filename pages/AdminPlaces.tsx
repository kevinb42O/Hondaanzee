import { ReviewCount } from '../components/admin/AdminReviewCounts.tsx';
import { useAdminReviewInsights } from '../utils/useAdminReviewInsights.ts';
import { reviewInsightsPath, reviewPlacePath } from '../utils/reviewInsights.ts';
import { FavoriteCount } from '../components/admin/AdminFavoriteCount.tsx';
import { useAdminFavoriteCounts } from '../utils/useAdminFavoriteCounts.ts';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CITIES } from '../cityData.ts';
import { getPlaceDetailPath } from '../utils/placeRoutes.ts';
import { adminContent, type ContentPlace } from '../utils/adminContent.ts';
const cities = new Map(CITIES.map(city => [city.slug, city.name]));

export default function AdminPlaces() {
  const favoriteCounts = useAdminFavoriteCounts();
  const reviewInsights = useAdminReviewInsights();
  const reviewCounts = useMemo(() => reviewInsights.data ? Object.fromEntries(reviewInsights.data.places.map(p => [p.place_id, p])) : null, [reviewInsights.data]);
  const [sort, setSort] = useState('name');
  const [records, setRecords] = useState<ContentPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { const data = await adminContent<{ places: ContentPlace[] }>({ action: 'list' }); setRecords(data.places); }
    catch (err) { setError(err instanceof Error ? err.message : 'Kon de zaken niet laden.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const catalog = useMemo(() => records.map(record => ({ ...record.draft.content, kind: record.kind, record })).sort((a, b) => a.name.localeCompare(b.name, 'nl')), [records]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [kind, setKind] = useState('');
  const matches = useMemo(() => {
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl');
    const term = normalize(query.trim());
    return catalog.filter(place => (!city || place.city === city) && (!kind || place.kind === kind) && (!term || normalize(`${place.name} ${place.type} ${cities.get(place.city)} ${place.address}`).includes(term))).sort((a,b) => (sort === 'saved' ? (favoriteCounts.counts?.[b.record.id] || 0) - (favoriteCounts.counts?.[a.record.id] || 0) : sort === 'likes' ? (reviewCounts?.[b.record.id]?.like_count || 0) - (reviewCounts?.[a.record.id]?.like_count || 0) : sort === 'reviews' ? (reviewCounts?.[b.record.id]?.review_count || 0) - (reviewCounts?.[a.record.id]?.review_count || 0) : 0) || a.name.localeCompare(b.name, 'nl'));
  }, [query, city, kind, catalog, sort, favoriteCounts.counts, reviewCounts]);

  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">Je hondvriendelijke adressen</p><h1>Zaken</h1><p>Beheer de vermeldingen in je kustgids.</p></div><Link to="/admin/zaken/nieuw" className="workspace-button workspace-button-primary"><Plus size={17} />Nieuwe zaak</Link></div>
    {loading ? <section className="workspace-panel" role="status">Zaken laden…</section> : error ? <section className="workspace-panel"><p className="workspace-error" role="alert">{error}</p><button className="workspace-button" onClick={() => void load()}>Opnieuw proberen</button></section> : <>
    <section className="workspace-panel">
      <div className="workspace-filters workspace-place-filters"><label className="workspace-search"><span className="sr-only">Zoek een zaak</span><Search size={17} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Zoek op naam, adres of gemeente" /></label><label><span className="sr-only">Gemeente</span><select value={city} onChange={event => setCity(event.target.value)}><option value="">Alle gemeenten</option>{CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label><span className="sr-only">Soort vermelding</span><select value={kind} onChange={event => setKind(event.target.value)}><option value="">Alle zaken</option><option value="hotspot">Hotspots</option><option value="service">Diensten</option></select></label><select aria-label="Sorteer zaken" value={sort} onChange={e => setSort(e.target.value)}><option value="name">Naam A–Z</option><option value="saved" disabled={!favoriteCounts.counts}>Meest bewaard</option><option value="likes" disabled={!reviewCounts}>Meeste likes</option><option value="reviews" disabled={!reviewCounts}>Meeste reviews</option></select></div>
      <div className="workspace-favorite-list-tools"><Link to="/admin/favorieten" className="workspace-text-link">Bekijk alle bewaarstatistieken</Link><Link to={reviewInsightsPath()} className="workspace-text-link">Bekijk likes & reviews</Link><button className="workspace-text-link" disabled={favoriteCounts.loading} onClick={() => void favoriteCounts.refresh()}>Bewaarcijfers vernieuwen</button></div>
      {favoriteCounts.error && <p className="workspace-note" role="status">Bewaarcijfers konden niet geladen worden. Je kunt de zaken gewoon blijven beheren.</p>}
      {reviewInsights.error && <p className="workspace-note" role="status">{reviewInsights.data ? 'Likes en reviews konden niet worden vernieuwd; dit zijn de vorige cijfers.' : 'Likes en reviews konden niet geladen worden.'} <button className="workspace-text-link" disabled={reviewInsights.loading} onClick={() => void reviewInsights.refresh()}>Opnieuw proberen</button></p>}
      <p className="workspace-result-count" role="status">{matches.length} {matches.length === 1 ? 'zaak' : 'zaken'}</p>
      {matches.length ? <div className="workspace-table-scroll"><table className="workspace-table workspace-place-insights-table"><thead><tr><th>Zaak</th><th>Gemeente</th><th>Bewaard</th><th>Likes</th><th>Reviews</th><th>Status</th><th><span className="sr-only">Acties</span></th></tr></thead><tbody>{matches.map(place => <tr key={place.record.id}><td><div className="workspace-place-name">{place.image && <img src={place.image} alt="" loading="lazy" />}<span><Link to={`/admin/zaken/${place.record.id}`}><strong>{place.name}</strong></Link><small>{place.type}</small></span></div></td><td>{cities.get(place.city) || place.city}</td><td><FavoriteCount count={favoriteCounts.counts?.[place.record.id]} error={favoriteCounts.error} /></td><td>{place.kind === 'hotspot' ? <ReviewCount label="Huidige likes" count={reviewCounts?.[place.record.id]?.like_count} error={!!reviewInsights.error} /> : '—'}</td><td>{place.kind === 'hotspot' ? reviewCounts?.[place.record.id] ? <Link to={reviewPlacePath(place.record.id)} className="workspace-text-link">{reviewCounts[place.record.id].review_count}{reviewCounts[place.record.id].average != null && <small className="workspace-review-count-note">{reviewCounts[place.record.id].average!.toLocaleString('nl-BE')}/5</small>}</Link> : reviewInsights.error ? '—' : '…' : '—'}</td><td>{!place.record.published_revision_id ? 'Nieuw concept' : place.record.draft_revision_id !== place.record.published_revision_id ? 'Conceptwijzigingen' : 'Gepubliceerd'}</td><td><div className="workspace-actions"><Link to={`/admin/zaken/${place.record.id}`} className="workspace-text-link">Bewerk</Link>{place.record.published_revision_id && <Link to={getPlaceDetailPath(place, place.kind)} className="workspace-text-link" aria-label={`Bekijk de zaakpagina van ${place.name}`}>Bekijk <ArrowUpRight size={15} /></Link>}</div></td></tr>)}</tbody></table></div> : <div className="workspace-empty"><Search size={24} /><h2>Geen zaken gevonden</h2><p>Probeer een andere zoekterm of pas de filters aan.</p><button type="button" className="workspace-button" onClick={() => { setQuery(''); setCity(''); setKind(''); }}>Wis filters</button></div>}
    </section>
    <p className="workspace-note">Opslaan bewaart een concept. Selecteer je wijzigingen daarna bij Publiceren. Nieuwe foto’s lopen via R2 zodra het mediadomein actief is.</p>
    </>}
  </>;
}
