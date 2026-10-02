import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { CITIES } from '../cityData.ts';
import { adminContent, type ContentPlace } from '../utils/adminContent.ts';
import { HOTSPOT_TYPES, SERVICE_TYPES } from '../supabase/functions/_shared/contentDraft.ts';

const fields = [
  ['name', 'Naam', 200], ['summary', 'Korte samenvatting', 1200],
  ['description', 'Beschrijving', 12000], ['recommendationNote', 'Bezoekadvies', 2000],
  ['address', 'Adres', 400], ['phone', 'Telefoonnummer', 80],
  ['website', 'Website', 1000], ['websiteLabel', 'Label voor de websitelink', 100],
] as const;
export default function AdminPlaceEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [place, setPlace] = useState<ContentPlace | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [changed, setChanged] = useState<Record<string, string>>({});
  const [kind, setKind] = useState<'hotspot' | 'service'>('hotspot');
  const [city, setCity] = useState(CITIES[0].slug);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [preview, setPreview] = useState(false);
  const loadSequence = useRef(0);
  const load = async () => {
    if (!id) return;
    const sequence = ++loadSequence.current;
    setLoading(true); setError('');
    try {
      const result = await adminContent<{ place: ContentPlace }>({ action: 'detail', id });
      if (sequence !== loadSequence.current) return;
      const content = result.place.draft.content;
      setPlace(result.place); setKind(result.place.kind); setCity(content.city); setSlug(content.slug);
      setValues(Object.fromEntries([...fields.map(([key]) => [key, content[key] || '']), ['type', content.type], ['tags', content.tags.join(', ')]]));
      setChanged({});
    } catch (err) { if (sequence === loadSequence.current) setError(err instanceof Error ? err.message : 'Kon de zaak niet laden.'); }
    finally { if (sequence === loadSequence.current) setLoading(false); }
  };
  useEffect(() => {
    setPlace(null); setSaved(''); setChanged({}); setValues({}); setSaving(false);
    if (id) void load(); else { setLoading(false); setKind('hotspot'); setCity(CITIES[0].slug); setSlug(''); }
    return () => { loadSequence.current++; };
  }, [id]);
  useEffect(() => {
    if (!Object.keys(changed).length) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const warnLink = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest('a[href]');
      if (link && !saving && !window.confirm('Je hebt niet-opgeslagen wijzigingen. Wil je deze pagina verlaten?')) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', warnLink, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', warnLink, true); };
  }, [changed, saving]);
  const update = (key: string, value: string) => { setValues(previous => ({ ...previous, [key]: value })); setChanged(previous => ({ ...previous, [key]: value })); setSaved(''); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setSaved('');
    const sequence = loadSequence.current;
    const patch: Record<string, unknown> = { ...changed };
    if (isNew) for (const field of ['name', 'description', 'address', 'type']) patch[field] = values[field] || (field === 'type' ? (kind === 'hotspot' ? HOTSPOT_TYPES[0] : SERVICE_TYPES[0]) : '');
    if ('tags' in patch) patch.tags = String(patch.tags).split(',').map(value => value.trim()).filter(Boolean);
    try {
      if (isNew) {
        const result = await adminContent<{ id: string }>({ action: 'create', kind, city, slug, patch });
        if (sequence !== loadSequence.current) return;
        setChanged({}); navigate(`/admin/zaken/${result.id}`, { replace: true });
      } else {
        const result = await adminContent<{ version: number; revision_id: string }>({ action: 'save', id, version: place!.version, patch });
        if (sequence !== loadSequence.current) return;
        setPlace(previous => previous ? { ...previous, version: result.version, draft_revision_id: result.revision_id } : previous);
        setChanged({}); setSaved('Concept opgeslagen. De openbare pagina blijft op haar gepubliceerde versie.');
      }
    } catch (err) { if (sequence === loadSequence.current) setError(err instanceof Error ? err.message : 'Kon het concept niet opslaan.'); }
    finally { if (sequence === loadSequence.current) setSaving(false); }
  };
  const types = kind === 'hotspot' ? HOTSPOT_TYPES : SERVICE_TYPES;
  return <>
    <Link to="/admin/zaken" className="workspace-text-link"><ArrowLeft size={15} />Alle zaken</Link>
    <div className="workspace-page-heading workspace-editor-heading"><div><p className="workspace-eyebrow">Zakenbeheer</p><h1>{isNew ? 'Nieuwe zaak' : values.name || 'Zaak bewerken'}</h1><p>{isNew ? 'Begin met een concept voor je kustgids.' : `Concept · versie ${place?.version || '…'}`}</p></div><button type="button" className="workspace-button" onClick={() => setPreview(value => !value)}>{preview ? 'Verder bewerken' : 'Concept bekijken'}</button></div>
    {loading ? <section className="workspace-panel" role="status">Zaak laden…</section> : !isNew && !place ? <section className="workspace-panel"><p className="workspace-error" role="alert">{error}</p><button className="workspace-button" onClick={() => void load()}>Opnieuw proberen</button></section> : <form onSubmit={save}>
      <div className="workspace-editor-grid"><div className="workspace-panel workspace-form">
        {preview ? <article className="workspace-draft-preview"><span className="workspace-status">Conceptvoorbeeld</span>{place?.draft.content.image && <img src={place.draft.content.image} alt="" />}<h2>{values.name || 'Naam van je zaak'}</h2><p>{values.summary}</p><p>{values.description}</p><p>{values.recommendationNote}</p><p>{values.address}</p></article> : <>
          <h2>Over de zaak</h2>
          {fields.map(([key, label, max]) => <label key={key}>{label}{['description', 'summary', 'recommendationNote'].includes(key) ? <textarea name={key} value={values[key] || ''} onChange={event => update(key, event.target.value)} maxLength={max} required={key === 'description'} rows={key === 'description' ? 7 : 3} /> : <input name={key} value={values[key] || ''} onChange={event => update(key, event.target.value)} maxLength={max} required={key === 'name' || key === 'address'} type={key === 'website' ? 'url' : key === 'phone' ? 'tel' : 'text'} />}</label>)}
          <label>Hondvriendelijke kenmerken<input name="tags" value={values.tags || ''} onChange={event => update('tags', event.target.value)} placeholder="Bijvoorbeeld: Honden welkom, Terras" /><small>Scheid kenmerken met een komma.</small></label>
        </>}
      </div><aside className="workspace-editor-aside">
        <section className="workspace-panel workspace-form"><h2>Vermelding</h2><label>Soort<select value={kind} disabled={!isNew} onChange={event => { const next = event.target.value as typeof kind; setKind(next); update('type', next === 'hotspot' ? HOTSPOT_TYPES[0] : SERVICE_TYPES[0]); }}><option value="hotspot">Hotspot</option><option value="service">Dienst</option></select></label><label>Categorie<select name="type" value={values.type || types[0]} onChange={event => update('type', event.target.value)}>{types.map(type => <option key={type}>{type}</option>)}</select></label><label>Gemeente<select value={city} disabled={!isNew} onChange={event => setCity(event.target.value)}>{CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label>Vaste URL-slug<input value={slug} disabled={!isNew} onChange={event => setSlug(event.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={160} placeholder="naam-van-de-zaak" /></label><p className="workspace-note">De gemeente en slug bepalen de vaste zaak-URL.</p></section>
        <section className="workspace-panel"><h2>Foto's</h2>{place?.draft.content.image ? <div className="workspace-legacy-gallery">{[place.draft.content.image, ...(place.draft.content.images || []).filter(url => url !== place.draft.content.image)].map((url, index) => <img src={url} alt={`Bestaande foto ${index + 1}`} key={`${index}-${url}`} />)}</div> : <p className="workspace-muted">Nog geen foto's toegevoegd.</p>}<p className="workspace-note">Nieuwe foto's krijgen een R2-upload zodra het mediadomein actief is. Je huidige foto's blijven op hun bestaande locatie.</p></section>
      </aside></div>
      {error && <div className="workspace-error" role="alert"><p>{error}</p>{place && <button type="button" className="workspace-button" onClick={() => { if (!Object.keys(changed).length || window.confirm('Je niet-opgeslagen wijzigingen worden vervangen door de laatste opgeslagen versie. Wil je verdergaan?')) void load(); }}>Laatste versie laden</button>}</div>}{saved && <p className="workspace-success" role="status">{saved}</p>}
      <div className="workspace-savebar"><span className="workspace-muted">{Object.keys(changed).length ? 'Je hebt niet-opgeslagen wijzigingen.' : 'Opslaan als concept; publiceren volgt afzonderlijk.'}</span><button className="workspace-button workspace-button-primary" disabled={saving || loading || (!isNew && !Object.keys(changed).length)}><Save size={17} />{saving ? 'Opslaan…' : 'Concept opslaan'}</button></div>
    </form>}
  </>;
}
