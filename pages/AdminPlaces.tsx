import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CITIES } from '../cityData.ts';
import { getPlaceDetailPath } from '../utils/placeRoutes.ts';
import { adminContent, type ContentPlace } from '../utils/adminContent.ts';
const cities = new Map(CITIES.map(city => [city.slug, city.name]));

export default function AdminPlaces() {
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
    return catalog.filter(place => (!city || place.city === city) && (!kind || place.kind === kind) && (!term || normalize(`${place.name} ${place.type} ${cities.get(place.city)} ${place.address}`).includes(term)));
  }, [query, city, kind, catalog]);

  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">Je hondvriendelijke adressen</p><h1>Zaken</h1><p>Beheer de vermeldingen in je kustgids.</p></div><Link to="/admin/zaken/nieuw" className="workspace-button workspace-button-primary"><Plus size={17} />Nieuwe zaak</Link></div>
    {loading ? <section className="workspace-panel" role="status">Zaken laden…</section> : error ? <section className="workspace-panel"><p className="workspace-error" role="alert">{error}</p><button className="workspace-button" onClick={() => void load()}>Opnieuw proberen</button></section> : <>
    <section className="workspace-panel">
      <div className="workspace-filters"><label className="workspace-search"><span className="sr-only">Zoek een zaak</span><Search size={17} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Zoek op naam, adres of gemeente" /></label><label><span className="sr-only">Gemeente</span><select value={city} onChange={event => setCity(event.target.value)}><option value="">Alle gemeenten</option>{CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label><span className="sr-only">Soort vermelding</span><select value={kind} onChange={event => setKind(event.target.value)}><option value="">Alle zaken</option><option value="hotspot">Hotspots</option><option value="service">Diensten</option></select></label></div>
      <p className="workspace-result-count" role="status">{matches.length} {matches.length === 1 ? 'zaak' : 'zaken'}</p>
      {matches.length ? <div className="workspace-table-scroll"><table className="workspace-table"><thead><tr><th>Zaak</th><th>Gemeente</th><th>Status</th><th><span className="sr-only">Acties</span></th></tr></thead><tbody>{matches.map(place => <tr key={place.record.id}><td><div className="workspace-place-name">{place.image && <img src={place.image} alt="" loading="lazy" />}<span><Link to={`/admin/zaken/${place.record.id}`}><strong>{place.name}</strong></Link><small>{place.type}</small></span></div></td><td>{cities.get(place.city) || place.city}</td><td>{!place.record.published_revision_id ? 'Nieuw concept' : place.record.draft_revision_id !== place.record.published_revision_id ? 'Conceptwijzigingen' : 'Gepubliceerd'}</td><td><div className="workspace-actions"><Link to={`/admin/zaken/${place.record.id}`} className="workspace-text-link">Bewerk</Link>{place.record.published_revision_id && <Link to={getPlaceDetailPath(place, place.kind)} className="workspace-text-link" aria-label={`Bekijk de zaakpagina van ${place.name}`}>Bekijk <ArrowUpRight size={15} /></Link>}</div></td></tr>)}</tbody></table></div> : <div className="workspace-empty"><Search size={24} /><h2>Geen zaken gevonden</h2><p>Probeer een andere zoekterm of pas de filters aan.</p><button type="button" className="workspace-button" onClick={() => { setQuery(''); setCity(''); setKind(''); }}>Wis filters</button></div>}
    </section>
    <p className="workspace-note">Opslaan bewaart een concept. Publicatie en nieuwe R2-foto's worden als volgende stap gekoppeld.</p>
    </>}
  </>;
}
