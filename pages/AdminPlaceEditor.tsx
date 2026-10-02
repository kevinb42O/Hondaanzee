import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import AdminFavoriteCount from '../components/admin/AdminFavoriteCount.tsx';
import AdminMediaPicker, { type PlaceMedia } from '../components/admin/AdminMediaPicker.tsx';
import { ResolvedPlaceDetail } from './PlaceDetail.tsx';
import type { Hotspot, Service } from '../types.ts';
import { CITIES } from '../cityData.ts';
import { adminContent, type ContentPlace } from '../utils/adminContent.ts';
import { HOTSPOT_TYPES, SERVICE_TYPES, contentDraftPatch } from '../supabase/functions/_shared/contentDraft.ts';
import { PLACE_FIELDS, PLACE_BLOCKS, HOURS_MODES, DAYS, getHoursMode, getPlaceCategory, CATEGORY_COPY, getTagGroup, isPlaceBlockVisible, type PlaceBlock } from '../supabase/functions/_shared/placeFields.ts';
import { placeToValues, buildPlacePatch, applyPlacePatch } from '../utils/placeEditor.ts';

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
  const [media, setMedia] = useState<PlaceMedia>({ image: '', images: [], imagePosition: 'center' });
  const [mediaChanged, setMediaChanged] = useState(false);
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
      setValues(placeToValues(content)); setChanged({});
      setMedia({ image: content.image, images: content.images ? [...content.images] : content.image ? [content.image] : [], imagePosition: content.imagePosition || 'center' }); setMediaChanged(false);
    } catch (err) { if (sequence === loadSequence.current) setError(err instanceof Error ? err.message : 'Kon de zaak niet laden.'); }
    finally { if (sequence === loadSequence.current) setLoading(false); }
  };
  useEffect(() => {
    setPlace(null); setSaved(''); setPreview(false); setMediaChanged(false); setMedia({ image: '', images: [], imagePosition: 'center' }); setChanged({}); setValues({}); setSaving(false);
    if (id) void load(); else { setLoading(false); setKind('hotspot'); setCity(CITIES[0].slug); setSlug(''); }
    return () => { loadSequence.current++; };
  }, [id]);
  const dirty = Object.keys(changed).length > 0 || mediaChanged;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const warnLink = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest('a[href]');
      if (link && !saving && !window.confirm('Je hebt niet-opgeslagen wijzigingen. Wil je deze pagina verlaten?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', warn); document.addEventListener('click', warnLink, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', warnLink, true); };
  }, [dirty, saving]);
  const update = (key: string, value: string) => { setValues(previous => ({ ...previous, [key]: value })); setChanged(previous => ({ ...previous, [key]: value })); setSaved(''); };
  const types = kind === 'hotspot' ? HOTSPOT_TYPES : SERVICE_TYPES;
  const original = place?.draft.content || { id: 0, name: '', description: '', address: '', image: '', tags: [], city, slug, type: types[0] } as Hotspot | Service;
  const current = { ...applyPlacePatch(original, buildPlacePatch(changed, values, original)), ...media, city, slug, type: values.type || types[0] } as Hotspot | Service;
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setSaved('');
    const sequence = loadSequence.current;
    const patch = buildPlacePatch(changed, values, original);
    if (isNew) for (const field of ['name', 'description', 'address', 'type']) patch[field] = values[field] || (field === 'type' ? types[0] : '');
    try {
      const parsed = contentDraftPatch.safeParse(patch);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Controleer de ingevoerde gegevens.');
      if (isNew) {
        const result = await adminContent<{ id: string }>({ action: 'create', kind, city, slug, patch: parsed.data });
        if (sequence !== loadSequence.current) return;
        setChanged({}); navigate(`/admin/zaken/${result.id}`, { replace: true });
      } else {
        const result = await adminContent<{ version: number; revision_id: string; content?: Hotspot | Service }>({ action: 'save', id, version: place!.version, patch: parsed.data, ...(mediaChanged ? { media } : {}) });
        if (sequence !== loadSequence.current) return;
        // Older servers can be read during rollout; the new endpoint returns normalized content.
        const content = result.content || { ...applyPlacePatch(original, parsed.data), ...(mediaChanged ? media : {}) };
        setPlace(previous => previous ? { ...previous, version: result.version, draft_revision_id: result.revision_id, draft: { content } } : previous);
        setValues(placeToValues(content)); setChanged({}); setMediaChanged(false);
        setSaved('Concept opgeslagen. De openbare pagina blijft op haar gepubliceerde versie.');
      }
    } catch (err) { if (sequence === loadSequence.current) setError(err instanceof Error ? err.message : 'Kon het concept niet opslaan.'); }
    finally { if (sequence === loadSequence.current) setSaving(false); }
  };
  const visibility = (block: PlaceBlock) => {
    const choice = values[`visibility_${block}`] || 'auto';
    const shown = isPlaceBlockVisible(current, block);
    return <label className="workspace-visibility">{PLACE_BLOCKS[block]} op de website<select disabled={saving} name={`visibility_${block}`} value={choice} onChange={event => update(`visibility_${block}`, event.target.value)}><option value="auto">Automatisch</option><option value="show">Tonen</option><option value="hide">Verbergen</option></select><small>{choice === 'hide' ? 'Verborgen · ingevulde inhoud blijft bewaard.' : shown ? `${choice === 'auto' ? 'Automatisch' : 'Tonen'} · zichtbaar` : 'Nog niet ingevuld · geen leeg blok op de website.'}</small></label>;
  };
  const fieldInputs = (section: string) => PLACE_FIELDS.filter(field => field[3] === section).map(([key, label, max]) => <label key={key}>{label}{['description', 'summary', 'recommendationNote', 'practicalNote'].includes(key) ? <textarea disabled={saving} name={key} value={values[key] || ''} onChange={event => update(key, event.target.value)} maxLength={max} required={key === 'description'} rows={key === 'description' ? 7 : 3} /> : <input disabled={saving} name={key} value={values[key] || ''} onChange={event => update(key, event.target.value)} maxLength={max} required={key === 'name' || key === 'address'} type={key === 'website' ? 'url' : key === 'phone' ? 'tel' : 'text'} />}</label>);
  const mode = getHoursMode(current);
  return <>
    <Link to="/admin/zaken" className="workspace-text-link"><ArrowLeft size={15} />Alle zaken</Link>
    <div className="workspace-page-heading workspace-editor-heading"><div><p className="workspace-eyebrow">Zakenbeheer</p><h1>{isNew ? 'Nieuwe zaak' : values.name || 'Zaak bewerken'}</h1><p>{isNew ? 'Begin met een concept voor je kustgids.' : `Concept · versie ${place?.version || '…'}`}</p></div><button type="button" className="workspace-button" disabled={saving} onClick={() => setPreview(value => !value)}>{preview ? 'Verder bewerken' : 'Concept bekijken'}</button></div>
    {place && <AdminFavoriteCount key={place.id} id={place.id} />}
    {loading ? <section className="workspace-panel" role="status">Zaak laden…</section> : !isNew && !place ? <section className="workspace-panel"><p className="workspace-error" role="alert">{error}</p><button className="workspace-button" onClick={() => void load()}>Opnieuw proberen</button></section> : <form onSubmit={save}>
      <div className="workspace-editor-grid"><div className="workspace-panel workspace-form">
        {preview ? <div className="workspace-public-preview" onClickCapture={event => { if ((event.target as Element).closest('a')) { event.preventDefault(); event.stopPropagation(); } }}><ResolvedPlaceDetail preview kind={kind} cityData={CITIES.find(item => item.slug === city)!} place={{ ...current, name: current.name || 'Naam van je zaak' }} /></div> : <>
          <section className="workspace-field-section"><h2>Basis</h2>{fieldInputs('basis')}</section>
          <section className="workspace-field-section"><h2>Contact</h2>{fieldInputs('contact')}{visibility('phone')}{visibility('website')}<label>Officiële en sociale links<textarea disabled={saving} name="sameAs" value={values.sameAs || ''} onChange={event => update('sameAs', event.target.value)} rows={3} placeholder="Eén volledige link per regel" /></label>{visibility('socialLinks')}</section>
          <section className="workspace-field-section"><h2>Openingstijden & beschikbaarheid</h2>{visibility('hours')}<label>Beschikbaarheid<select disabled={saving} name="openingHoursMode" value={mode} onChange={event => update('openingHoursMode', event.target.value)}>{Object.entries(HOURS_MODES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <details open={mode === 'schedule' || mode === 'variable'}><summary>Weekuren bewerken</summary><p className="workspace-note">Schrijf 10:00–18:00, 10:00–12:00, 14:00–18:00 of Gesloten. Leeg betekent onbekend. Bewaarde uren verschijnen bij vaste of variabele beschikbaarheid.</p><div className="workspace-hours">{DAYS.map(([day, label]) => <label key={day}>{label}<input disabled={saving} name={`hours_${day}`} value={values[`hours_${day}`] || ''} onChange={event => update(`hours_${day}`, event.target.value)} maxLength={100} /></label>)}</div></details>
            <label>Toelichting bij beschikbaarheid<textarea disabled={saving} name="openingHoursNote" value={values.openingHoursNote || ''} onChange={event => update('openingHoursNote', event.target.value)} maxLength={1000} rows={2} /></label><label>Openingstijden weersafhankelijk<select disabled={saving} name="openingHoursWeatherDependent" value={values.openingHoursWeatherDependent || 'false'} onChange={event => update('openingHoursWeatherDependent', event.target.value)}><option value="false">Nee</option><option value="true">Ja</option></select></label>
          </section>
          <section className="workspace-field-section"><h2>Met je hond & kenmerken</h2><label>Kenmerken<input disabled={saving} name="tags" value={values.tags || ''} onChange={event => update('tags', event.target.value)} placeholder="Bijvoorbeeld: Honden welkom, Terras" /><small>Scheid kenmerken met een komma. Het label Aanrader bepaalt de aanbevelingsmarkering; schrijf een eigen tip hieronder.</small></label>{visibility('dogInfo')}{visibility('features')}<div className="workspace-tag-groups">{current.tags.filter(tag => tag !== 'Aanrader').map(tag => <label key={tag}>{tag}<select disabled={saving} aria-label={`Groep voor ${tag}`} value={values[`group_${tag}`] || 'auto'} onChange={event => update(`group_${tag}`, event.target.value)}><option value="auto">Automatisch ({getTagGroup({ ...current, tagGroups: undefined }, tag) === 'dog' ? 'Met je hond' : 'Overige kenmerken'})</option><option value="dog">Met je hond</option><option value="other">Overige kenmerken</option></select></label>)}</div></section>
          <section className="workspace-field-section"><h2>Praktisch advies</h2>{visibility('practicalAdvice')}{fieldInputs('advies')}<p className="workspace-note">Zonder eigen tekst gebruikt deze categorie: {CATEGORY_COPY[getPlaceCategory(current)].note}</p></section>
          <section className="workspace-field-section"><h2>Onze tip</h2>{visibility('recommendation')}{fieldInputs('tip')}</section>
          <section className="workspace-field-section"><h2>Foto's</h2>{visibility('gallery')}<p className="workspace-note">De galerij beheer je rechts. De hoofdfoto blijft apart beschikbaar voor overzichtskaarten en sociale previews.</p></section>
        </>}
      </div><aside className="workspace-editor-aside">
        <section className="workspace-panel workspace-form"><h2>Vermelding</h2><label>Soort<select name="kind" value={kind} disabled={!isNew || saving} onChange={event => { const next = event.target.value as typeof kind; setKind(next); update('type', next === 'hotspot' ? HOTSPOT_TYPES[0] : SERVICE_TYPES[0]); }}><option value="hotspot">Hotspot</option><option value="service">Dienst</option></select></label><label>Categorie<select disabled={saving} name="type" value={values.type || types[0]} onChange={event => update('type', event.target.value)}>{types.map(type => <option key={type}>{type}</option>)}</select></label><p className="workspace-note">De categorie kiest passende standaardteksten. Je inhoud en weergavekeuzes blijven bewaard.</p><h3>{isNew ? 'Locatie & URL' : 'Vaste identiteit'}</h3><label>Gemeente<select value={city} disabled={!isNew} onChange={event => setCity(event.target.value)}>{CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label>Vaste URL-slug<input value={slug} disabled={!isNew} onChange={event => setSlug(event.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={160} placeholder="naam-van-de-zaak" /></label><p className="workspace-note">Soort, gemeente en slug houden de bestaande URL en favorieten gekoppeld.</p></section>
        <AdminMediaPicker key={id || 'new'} value={media} disabled={isNew || saving} onChange={next => { setMedia(next); setMediaChanged(true); setSaved(''); }} />
      </aside></div>
      {error && <div className="workspace-error" role="alert"><p>{error}</p>{place && <button type="button" className="workspace-button" onClick={() => { if (!dirty || window.confirm('Je niet-opgeslagen wijzigingen worden vervangen door de laatste opgeslagen versie. Wil je verdergaan?')) void load(); }}>Laatste versie laden</button>}</div>}{saved && <p className="workspace-success" role="status">{saved}</p>}
      <div className="workspace-savebar"><span className="workspace-muted">{dirty ? 'Je hebt niet-opgeslagen wijzigingen.' : 'Opslaan als concept; publiceer daarna via Publiceren.'}</span><button className="workspace-button workspace-button-primary" disabled={saving || loading || (!isNew && !dirty)}><Save size={17} />{saving ? 'Opslaan…' : 'Concept opslaan'}</button></div>
    </form>}
  </>;
}
