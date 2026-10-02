import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Download, MapPin, MessageSquare, RefreshCw, Search, ShieldCheck, ThumbsUp } from 'lucide-react';
import { CITIES } from '../cityData.ts';
import AdminReviewNavigation from '../components/admin/AdminReviewNavigation.tsx';
import { ReviewCount } from '../components/admin/AdminReviewCounts.tsx';
import { useAdminReviewInsights } from '../utils/useAdminReviewInsights.ts';
import { filterReviewInsightPlaces, reviewInsightAdminPath, reviewInsightMetrics, reviewInsightPublicPath, reviewInsightsCsv, reviewPlacePath, type ReviewInsightMetric } from '../utils/reviewInsights.ts';

const cities = Object.fromEntries(CITIES.map(c => [c.slug, c.name]));
const number = (value: number) => value.toLocaleString('nl-BE');
const when = (value: string | null) => value ? new Date(value).toLocaleString('nl-BE', { timeZone: 'Europe/Brussels', dateStyle: 'short', timeStyle: 'short' }) : '—';
const statuses = { published: 'Gepubliceerd', draft: 'Concept', archived: 'Gearchiveerd' };
export default function AdminReviewInsights() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, refresh } = useAdminReviewInsights();
  const [page, setPage] = useState(1);
  const query = params.get('q') || '', city = params.get('city') || '', kind = params.get('kind') || '', selected = params.get('place') || '';
  const rawMetric = params.get('metric') || '';
  const metric: ReviewInsightMetric = Object.hasOwn(reviewInsightMetrics, rawMetric) ? rawMetric as ReviewInsightMetric : 'like_count';
  const includeEmpty = params.get('empty') === '1' || !!selected;
  const matches = useMemo(() => filterReviewInsightPlaces(data?.places || [], { query, city, kind, selected, metric, includeEmpty }, cities), [data, query, city, kind, selected, metric, includeEmpty]);
  useEffect(() => { setPage(1); }, [query, city, kind, selected, metric, includeEmpty]);
  const pageCount = Math.max(1, Math.ceil(matches.length / 25)), currentPage = Math.min(page, pageCount);
  const shown = matches.slice((currentPage - 1) * 25, currentPage * 25);
  const change = (key: string, value: string) => setParams(previous => { const next = new URLSearchParams(previous); value ? next.set(key, value) : next.delete(key); return next; }, { replace: true });
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([reviewInsightsCsv(matches, cities)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `hondaanzee-likes-reviews-${new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const clear = () => setParams({ view: 'insights' });
  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">Wat vinden je bezoekers?</p><h1>Likes & reviews</h1><p>Volg waardering per plek en open de ervaringen achter de cijfers.</p></div><button className="workspace-button workspace-button-primary" disabled={loading} onClick={() => void refresh()}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Laden…' : 'Vernieuwen'}</button></div>
    <AdminReviewNavigation insights />
    {error && <div className="workspace-error" role="alert"><p>{error}</p><button className="workspace-button" disabled={loading} onClick={() => void refresh()}>Opnieuw proberen</button></div>}
    {loading && !data ? <section className="workspace-panel" role="status">Likes en reviews laden…</section> : data && <div className="workspace-review-insights" aria-busy={loading}>
      <p className="workspace-note">Alle hotspots en losloopzones · bijgewerkt op {when(data.generated_at)} (Brussel). {error && 'Vernieuwen mislukt; hieronder staat de vorige momentopname.'}</p>
      <div className="workspace-stats">
        <section className="workspace-stat"><span><ThumbsUp size={16} />Huidige likes</span><strong>{number(data.summary.like_count)}</strong><small>Van actieve accounts · uitsluitend hotspots</small></section>
        <section className="workspace-stat"><span><ThumbsUp size={16} />Recent geliket</span><strong>{number(data.summary.recent7_like_count)}</strong><small>In 7 dagen · {number(data.summary.recent30_like_count)} in 30 dagen, nog aanwezig</small></section>
        <section className="workspace-stat"><span><MessageSquare size={16} />Ontvangen reviews</span><strong>{number(data.summary.review_count)}</strong><small>Alle statussen · {number(data.summary.published_count)} goedgekeurde scorebijdragen</small></section>
        <section className="workspace-stat"><span><ShieldCheck size={16} />Te beoordelen</span><strong>{number(data.summary.attention_count)}</strong><small><Link to="/admin/reviews">Nieuwe inzendingen, wijzigingen en meldingen</Link></small></section>
      </div>
      <section className="workspace-panel">
        <div className="workspace-section-heading"><div><h2>Waardering per plek</h2><p className="workspace-muted">Filters gelden voor de lijst en de CSV. Klik op reviews om de inzendingen te bekijken.</p></div><button className="workspace-button" disabled={!matches.length || loading || !!error} onClick={exportCsv}><Download size={15} />CSV exporteren</button></div>
        <div className="workspace-filters workspace-review-insight-filters">
          <label className="workspace-search"><Search size={16} /><input type="search" aria-label="Zoek likes en reviews per plek" placeholder="Naam of gemeente" value={query} onChange={e => change('q', e.target.value)} /></label>
          <select aria-label="Gemeente voor likes en reviews" value={city} onChange={e => change('city', e.target.value)}><option value="">Alle gemeenten</option>{CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          <select aria-label="Soort plek voor likes en reviews" value={kind} onChange={e => change('kind', e.target.value)}><option value="">Alle soorten</option><option value="hotspot">Hotspots</option><option value="offleash">Losloopzones</option></select>
          <select aria-label="Sorteer likes en reviews" value={metric} onChange={e => change('metric', e.target.value)}>{Object.entries(reviewInsightMetrics).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        </div>
        <div className="workspace-favorite-options"><label><input type="checkbox" checked={includeEmpty} disabled={!!selected} onChange={e => change('empty', e.target.checked ? '1' : '')} />Toon ook plekken zonder likes of reviews</label>{params.size > 1 && <button className="workspace-text-link" onClick={clear}>Wis filters</button>}</div>
        {selected && <p className="workspace-note">Je bekijkt één plek. <button className="workspace-text-link" onClick={() => change('place', '')}>Bekijk alle plekken</button></p>}
        <p className="workspace-result-count" role="status">{number(matches.length)} {matches.length === 1 ? 'plek' : 'plekken'} · {number(matches.reduce((sum, p) => sum + p.like_count, 0))} likes · {number(matches.reduce((sum, p) => sum + p.review_count, 0))} reviews in deze selectie</p>
        {shown.length ? <div className="workspace-table-scroll"><table className="workspace-table workspace-review-insights-table"><thead><tr><th>Plek</th><th aria-sort={metric === 'like_count' ? 'descending' : 'none'}>Likes</th><th aria-sort={metric === 'recent7_like_count' ? 'descending' : 'none'}>In 7 dagen</th><th aria-sort={metric === 'recent30_like_count' ? 'descending' : 'none'}>In 30 dagen</th><th aria-sort={metric === 'review_count' ? 'descending' : 'none'}>Reviews</th><th>Sterren</th><th aria-sort={metric === 'attention_count' ? 'descending' : 'none'}>Te beoordelen</th><th aria-sort={metric === 'last_activity_at' ? 'descending' : 'none'}>Laatste bijdrage</th><th>Acties</th></tr></thead><tbody>{shown.map(p => <tr key={p.place_id}>
          <td><div className="workspace-place-name">{p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="workspace-favorite-placeholder"><MapPin size={19} /></span>}<span><Link to={reviewInsightAdminPath(p)}><strong>{p.name}</strong></Link><small>{p.kind === 'hotspot' ? 'Hotspot' : 'Losloopzone'} · {cities[p.city_slug] || p.city_slug}</small>{p.status !== 'published' && <small className="workspace-status">{statuses[p.status]}</small>}</span></div></td>
          <td>{p.kind === 'hotspot' ? <><ReviewCount label="Huidige likes" count={p.like_count} />{p.excluded_like_count > 0 && <small className="workspace-review-count-note">{number(p.excluded_like_count)} uitgesloten</small>}</> : <span title="Losloopzones ondersteunen geen likes">—</span>}</td>
          <td>{p.kind === 'hotspot' ? number(p.recent7_like_count) : '—'}</td><td>{p.kind === 'hotspot' ? number(p.recent30_like_count) : '—'}</td>
          <td><Link to={reviewPlacePath(p.place_id)} className="workspace-text-link" aria-label={`Bekijk ${p.review_count} reviews voor ${p.name}`}>{number(p.review_count)}</Link><small className="workspace-review-count-note">{number(p.published_count)} goedgekeurd</small></td>
          <td>{p.average == null ? <span title="Geen goedgekeurde scorebijdragen">—</span> : <><span className="workspace-review-count">{p.average.toLocaleString('nl-BE', { minimumFractionDigits: 1 })}/5</span><small className="workspace-review-count-note">{number(p.published_count)} {p.published_count === 1 ? 'beoordeling' : 'beoordelingen'}</small></>}</td>
          <td>{p.attention_count > 0 ? <Link className="workspace-text-link" to={reviewPlacePath(p.place_id, 'attention')} aria-label={`Beoordeel ${p.attention_count} reviews voor ${p.name}`}>{number(p.attention_count)} bekijken</Link> : '0'}</td>
          <td><small>{when(p.last_activity_at)}</small></td>
          <td><div className="workspace-actions"><Link to={reviewPlacePath(p.place_id)}>Reviews</Link>{reviewInsightPublicPath(p) && <Link to={reviewInsightPublicPath(p)!} target="_blank" rel="noopener noreferrer" aria-label={`Bekijk ${p.name} op de website`}><ArrowUpRight size={15} /></Link>}</div></td>
        </tr>)}</tbody></table></div> : <div className="workspace-empty"><MessageSquare size={26} /><h2>{data.summary.review_count + data.summary.like_count + data.summary.excluded_like_count === 0 ? 'Nog geen likes of reviews' : 'Geen plekken in deze selectie'}</h2><p>De cijfers verschijnen zodra bezoekers bijdragen. Je kunt ook plekken zonder bijdragen bekijken.</p><button className="workspace-button" onClick={() => setParams({ view: 'insights', empty: '1' })}>Toon alle plekken</button></div>}
        {pageCount > 1 && <div className="workspace-member-pagination"><button className="workspace-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Vorige</button><span>Pagina {currentPage} van {pageCount}</span><button className="workspace-button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Volgende</button></div>}
      </section>
      <details className="workspace-panel workspace-review-explanation"><summary>Zo lees je de cijfers</summary><div><ul><li>Bewaren is een privéfavoriet. Een like is publieke waardering. Per account en hotspot telt één huidige like; likes van geschorste accounts worden apart uitgesloten.{data.summary.excluded_like_count > 0 && ` Momenteel: ${number(data.summary.excluded_like_count)} uitgesloten.`}</li><li>De 7- en 30-dagencijfers tellen huidige likes volgens hun toevoegdatum. Verwijderde likes en verwijderde accounts tellen niet meer mee; dit is geen volledige klikgeschiedenis.</li><li>Reviews omvatten alle statussen. Sterren komen alleen van goedgekeurde bijdragen volgens de publieke scoreregels. Tijdens controle van een wijziging blijft de vorige goedgekeurde score gelden.</li><li>Laatste bijdrage is de laatste huidige like of auteurinzending, inclusief nieuwe hotspotreviewversies. Moderatie en tekstredactie schuiven die datum niet op.</li><li>Bij concepten en gearchiveerde plekken blijven de cijfers traceerbaar, terwijl de plek niet publiek beschikbaar is. Losloopzones hebben reviews; likes zijn alleen voor hotspots.</li></ul><Link className="workspace-text-link" to="/admin/favorieten">Bekijk de bewaarstatistieken</Link></div></details>
    </div>}
  </>;
}

