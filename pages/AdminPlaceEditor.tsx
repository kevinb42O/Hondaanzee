import AdminFavoriteCount from '../components/admin/AdminFavoriteCount.tsx';
import { ResolvedPlaceDetail } from './PlaceDetail.tsx';
import type { Hotspot,Service } from '../types.ts';
import AdminMediaPicker, { type PlaceMedia } from '../components/admin/AdminMediaPicker.tsx';
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
  const [media,setMedia]=useState<PlaceMedia>({image:'',images:[],imagePosition:'center'});
  const [mediaChanged,setMediaChanged]=useState(false);
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
      setValues(Object.fromEntries([...fields.map(([key]) => [key, content[key] || '']), ['type', content.type], ['tags', content.tags.join(', ')], ['sameAs',(content.sameAs||[]).join('\n')], ...('openingHours' in content ? Object.entries(content.openingHours||{}).map(([day,time])=>[`hours_${day}`,time===null?'Gesloten':String(time)]) : []), ['openingHoursNote','openingHoursNote' in content?content.openingHoursNote||'':''], ['openingHoursWeatherDependent','openingHoursWeatherDependent' in content&&content.openingHoursWeatherDependent?'true':'false']]));
      setChanged({}); setMedia({image:content.image,images:content.images ? [...content.images] : content.image?[content.image]:[],imagePosition:content.imagePosition||'center'});setMediaChanged(false);
    } catch (err) { if (sequence === loadSequence.current) setError(err instanceof Error ? err.message : 'Kon de zaak niet laden.'); }
    finally { if (sequence === loadSequence.current) setLoading(false); }
  };
  useEffect(() => {
    setPlace(null); setSaved(''); setMediaChanged(false); setMedia({image:'',images:[],imagePosition:'center'}); setChanged({}); setValues({}); setSaving(false);
    if (id) void load(); else { setLoading(false); setKind('hotspot'); setCity(CITIES[0].slug); setSlug(''); }
    return () => { loadSequence.current++; };
  }, [id]);
  useEffect(() => {
    if (!Object.keys(changed).length && !mediaChanged) return;
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
  }, [changed, saving, mediaChanged]);
  const update = (key: string, value: string) => { setValues(previous => ({ ...previous, [key]: value })); setChanged(previous => ({ ...previous, [key]: value })); setSaved(''); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setSaved('');
    const sequence = loadSequence.current;
    const patch: Record<string, unknown> = { ...changed };
    if (isNew) for (const field of ['name', 'description', 'address', 'type']) patch[field] = values[field] || (field === 'type' ? (kind === 'hotspot' ? HOTSPOT_TYPES[0] : SERVICE_TYPES[0]) : '');
    if ('tags' in patch) patch.tags = String(patch.tags).split(',').map(value => value.trim()).filter(Boolean);
    if('sameAs' in patch)patch.sameAs=String(patch.sameAs).split('\n').map(value=>value.trim()).filter(Boolean);
    const hours=Object.keys(patch).filter(key=>key.startsWith('hours_'));
    if(hours.length){patch.openingHours={...(place?.draft.content as Hotspot)?.openingHours};for(const key of hours){(patch.openingHours as Record<string,unknown>)[key.slice(6)]=String(patch[key]).toLowerCase()==='gesloten'?null:patch[key];delete patch[key];}}
    if('openingHoursWeatherDependent' in patch)patch.openingHoursWeatherDependent=patch.openingHoursWeatherDependent==='true';
    try {
      if (isNew) {
        const result = await adminContent<{ id: string }>({ action: 'create', kind, city, slug, patch });
        if (sequence !== loadSequence.current) return;
        setChanged({}); navigate(`/admin/zaken/${result.id}`, { replace: true });
      } else {
        const result = await adminContent<{ version: number; revision_id: string }>({ action: 'save', id, version: place!.version, patch, ...(mediaChanged?{media}: {}) });
        if (sequence !== loadSequence.current) return;
        setPlace(previous => previous ? { ...previous, version: result.version, draft_revision_id: result.revision_id } : previous);
        setChanged({});setMediaChanged(false);setPlace(previous=>previous?{...previous,draft:{content:{...previous.draft.content,...patch,...(mediaChanged?media:{})} as typeof previous.draft.content}}:previous); setSaved('Concept opgeslagen. De openbare pagina blijft op haar gepubliceerde versie.');
      }
    } catch (err) { if (sequence === loadSequence.current) setError(err instanceof Error ? err.message : 'Kon het concept niet opslaan.'); }
    finally { if (sequence === loadSequence.current) setSaving(false); }
  };
  const types = kind === 'hotspot' ? HOTSPOT_TYPES : SERVICE_TYPES;
  return <>
    <Link to="/admin/zaken" className="workspace-text-link"><ArrowLeft size={15} />Alle zaken</Link>
    <div className="workspace-page-heading workspace-editor-heading"><div><p className="workspace-eyebrow">Zakenbeheer</p><h1>{isNew ? 'Nieuwe zaak' : values.name || 'Zaak bewerken'}</h1><p>{isNew ? 'Begin met een concept voor je kustgids.' : `Concept · versie ${place?.version || '…'}`}</p></div><button type="button" className="workspace-button" onClick={() => setPreview(value => !value)}>{preview ? 'Verder bewerken' : 'Concept bekijken'}</button></div>
    {place && <AdminFavoriteCount key={place.id} id={place.id} />}
    {loading ? <section className="workspace-panel" role="status">Zaak laden…</section> : !isNew && !place ? <section className="workspace-panel"><p className="workspace-error" role="alert">{error}</p><button className="workspace-button" onClick={() => void load()}>Opnieuw proberen</button></section> : <form onSubmit={save}>
      <div className="workspace-editor-grid"><div className="workspace-panel workspace-form">
        {preview ? <div className="workspace-public-preview" onClickCapture={event=>{if((event.target as Element).closest('a'))event.preventDefault();}}><ResolvedPlaceDetail preview kind={kind} cityData={CITIES.find(item=>item.slug===city)!} place={{...(place?.draft.content||{id:0,tags:[],image:''}),...values,name:values.name||'Naam van je zaak',type:values.type||types[0],description:values.description||'',city,slug:slug||'concept',tags:(values.tags||'').split(',').map(value=>value.trim()).filter(Boolean),sameAs:(values.sameAs||'').split('\n').filter(Boolean),...(kind==='hotspot'?{openingHours:Object.fromEntries(['ma','di','wo','do','vr','za','zo'].map(day=>[day,(values[`hours_${day}`]||'').toLowerCase()==='gesloten'?null:values[`hours_${day}`]||''])),openingHoursWeatherDependent:values.openingHoursWeatherDependent==='true'}:{}),...media} as Hotspot|Service}/></div> : <>
          <h2>Over de zaak</h2>
          {fields.map(([key, label, max]) => <label key={key}>{label}{['description', 'summary', 'recommendationNote'].includes(key) ? <textarea name={key} value={values[key] || ''} onChange={event => update(key, event.target.value)} maxLength={max} required={key === 'description'} rows={key === 'description' ? 7 : 3} /> : <input name={key} value={values[key] || ''} onChange={event => update(key, event.target.value)} maxLength={max} required={key === 'name' || key === 'address'} type={key === 'website' ? 'url' : key === 'phone' ? 'tel' : 'text'} />}</label>)}
          <label>Hondvriendelijke kenmerken<input name="tags" value={values.tags || ''} onChange={event => update('tags', event.target.value)} placeholder="Bijvoorbeeld: Honden welkom, Terras" /><small>Scheid kenmerken met een komma.</small></label>
          <label>Sociale links<textarea name="sameAs" value={values.sameAs||''} onChange={event=>update('sameAs',event.target.value)} rows={3} placeholder="Eén volledige link per regel"/></label>
          {kind==='hotspot'&&<><h2>Openingstijden</h2><p className="workspace-note">Schrijf bijvoorbeeld 10:00–18:00 of Gesloten. Een leeg veld geeft nog geen bevestigde openingstijd aan.</p><div className="workspace-hours">{[['ma','Maandag'],['di','Dinsdag'],['wo','Woensdag'],['do','Donderdag'],['vr','Vrijdag'],['za','Zaterdag'],['zo','Zondag']].map(([day,label])=><label key={day}>{label}<input value={values[`hours_${day}`]||''} onChange={event=>update(`hours_${day}`,event.target.value)} maxLength={100}/></label>)}</div><label>Toelichting bij openingstijden<textarea value={values.openingHoursNote||''} onChange={event=>update('openingHoursNote',event.target.value)} maxLength={1000} rows={2}/></label><label>Openingstijden weersafhankelijk<select value={values.openingHoursWeatherDependent||'false'} onChange={event=>update('openingHoursWeatherDependent',event.target.value)}><option value="false">Nee</option><option value="true">Ja</option></select></label></>}

        </>}
      </div><aside className="workspace-editor-aside">
        <section className="workspace-panel workspace-form"><h2>Vermelding</h2><label>Soort<select value={kind} disabled={!isNew} onChange={event => { const next = event.target.value as typeof kind; setKind(next); update('type', next === 'hotspot' ? HOTSPOT_TYPES[0] : SERVICE_TYPES[0]); }}><option value="hotspot">Hotspot</option><option value="service">Dienst</option></select></label><label>Categorie<select name="type" value={values.type || types[0]} onChange={event => update('type', event.target.value)}>{types.map(type => <option key={type}>{type}</option>)}</select></label><label>Gemeente<select value={city} disabled={!isNew} onChange={event => setCity(event.target.value)}>{CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label>Vaste URL-slug<input value={slug} disabled={!isNew} onChange={event => setSlug(event.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={160} placeholder="naam-van-de-zaak" /></label><p className="workspace-note">De gemeente en slug bepalen de vaste zaak-URL.</p></section>
        <AdminMediaPicker key={id||"new"} value={media} disabled={isNew||saving} onChange={next=>{setMedia(next);setMediaChanged(true);setSaved('');}}/>
      </aside></div>
      {error && <div className="workspace-error" role="alert"><p>{error}</p>{place && <button type="button" className="workspace-button" onClick={() => { if ((!Object.keys(changed).length && !mediaChanged) || window.confirm('Je niet-opgeslagen wijzigingen worden vervangen door de laatste opgeslagen versie. Wil je verdergaan?')) void load(); }}>Laatste versie laden</button>}</div>}{saved && <p className="workspace-success" role="status">{saved}</p>}
      <div className="workspace-savebar"><span className="workspace-muted">{Object.keys(changed).length || mediaChanged ? 'Je hebt niet-opgeslagen wijzigingen.' : 'Opslaan als concept; publiceer daarna via Publiceren.'}</span><button className="workspace-button workspace-button-primary" disabled={saving || loading || (!isNew && !Object.keys(changed).length && !mediaChanged)}><Save size={17} />{saving ? 'Opslaan…' : 'Concept opslaan'}</button></div>
    </form>}
  </>;
}
