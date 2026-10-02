import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, ChevronRight, Copy, ExternalLink, History, Loader2, RefreshCw, Search, Send, Smartphone, Sparkles, Trash2, Users } from 'lucide-react';
import AdminDialog from '../components/admin/AdminDialog.tsx';
import { adminFunction } from '../utils/adminContent.ts';
import { normalizePushUrl, PUSH_BODY_LIMIT, PUSH_TITLE_LIMIT, pushDeliveryLabel, pushUrlError, type PushLogEntry } from '../utils/adminNotifications.ts';

const DRAFT_KEY = 'haz-admin-push-draft-v1';
const templates = [
  { label: 'Nieuwe update', title: '🆕 Nieuwe update op HondAanZee', body: 'We hebben net iets nieuws toegevoegd. Bekijk de laatste verbeteringen en nieuwigheden op de updatepagina.', url: '/updates' },
  { label: 'Waarschuwing aan de kust', title: '⚠️ Belangrijke melding aan de kust', body: 'Er is een nieuwe melding die interessant kan zijn voor hondeneigenaars aan zee. Bekijk de details op HondAanZee.', url: '/meldpunt' },
  { label: 'Nieuw artikel', title: '📖 Nieuwe blog voor kustwandelaars', body: 'Er staat een nieuw artikel klaar met tips voor een zorgeloze uitstap met je hond aan de Belgische kust.', url: '/blog' },
  { label: 'Evenement', title: '📅 Hondvriendelijk event aan zee', body: 'Er staat een nieuw hondvriendelijk evenement in de agenda. Ideaal om samen met je hond te plannen.', url: '/agenda' },
];
const destinations = [{label:'Home',value:'/'},{label:'Updates',value:'/updates'},{label:'Meldpunt',value:'/meldpunt'},{label:'Blog',value:'/blog'},{label:'Agenda',value:'/agenda'},{label:'Losloopzones',value:'/losloopzones'},{label:'Kaart',value:'/kaart'}];
const emojis = ['🐾','🌊','🏖️','☀️','🌅','🐶','🦴','🐕','✅','⚠️','📍','ℹ️','🆕','💡','📢','🔔','👉','👇','📲','💙','✨','🎉','🙏','🧭'];
interface Draft { title: string; body: string; url: string }
interface SendResult { ok: boolean; sent: number; failed: number; total: number; expired: number }
const emptyDraft: Draft = {title:'',body:'',url:'/'};
const dateLabel = (iso: string) => new Date(iso).toLocaleString('nl-BE',{timeZone:'Europe/Brussels',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

function NotificationPreview({ draft, placeholder = true }: { draft: Draft; placeholder?: boolean }) {
  return <div className="workspace-push-preview" aria-label="Voorvertoning notificatie">
    <div className="workspace-push-preview-meta"><span><Bell size={12}/> HOND AAN ZEE</span><span>nu</span></div>
    <div className="workspace-push-preview-message"><img src="/notification-icon-192.png" alt=""/><div>
      <h3>{draft.title.trim() || (placeholder ? 'Je titel verschijnt hier' : '')}</h3>
      {(draft.body.trim() || placeholder) && <p>{draft.body.trim() || 'Schrijf een korte boodschap voor een fijne dag aan zee.'}</p>}
    </div></div>
  </div>;
}

export default function AdminNotifications() {
  const [draft,setDraft] = useState<Draft>(emptyDraft);
  const [draftLoaded,setDraftLoaded] = useState(false);
  const [draftStored,setDraftStored] = useState(true);
  const [tab,setTab] = useState<'compose'|'history'>('compose');
  const [subscribers,setSubscribers] = useState<number|null>(null);
  const [log,setLog] = useState<PushLogEntry[]>([]);
  const [loading,setLoading] = useState(true);
  const [statsReady,setStatsReady] = useState(false);
  const [sending,setSending] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [result,setResult] = useState<SendResult|null>(null);
  const [updatedAt,setUpdatedAt] = useState<string|null>(null);
  const [search,setSearch] = useState('');
  const [selectedLog,setSelectedLog] = useState<PushLogEntry|null>(null);
  const [confirmation,setConfirmation] = useState<Draft|null>(null);
  const [replacement,setReplacement] = useState<{draft:Draft; label:string}|null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const activeField = useRef<'title'|'body'>('body');
  const alive = useRef(true);
  const sendLock = useRef(false);
  const normalizedUrl = normalizePushUrl(draft.url);
  const urlError = pushUrlError(draft.url);
  const hasDraft = !!(draft.title || draft.body || normalizedUrl !== '/');
  const canSend = statsReady && !loading && !sending && !!draft.title.trim() && draft.title.length <= PUSH_TITLE_LIMIT && draft.body.length <= PUSH_BODY_LIMIT && !urlError && (subscribers ?? 0) > 0;
  const filteredLog = log.filter(entry => `${entry.title} ${entry.body || ''} ${entry.url || ''}`.toLocaleLowerCase('nl').includes(search.trim().toLocaleLowerCase('nl')));

  async function loadStats() {
    setLoading(true);
    try {
      const data = await adminFunction<{subscriber_count:number;log:PushLogEntry[]}>('list-push-stats',{});
      if (!alive.current) return;
      setSubscribers(data.subscriber_count); setLog(data.log || []); setStatsReady(true); setUpdatedAt(new Date().toISOString()); setError(null);
    } catch (cause) { if(alive.current) {setStatsReady(false);setError(cause instanceof Error?cause.message:'Kon notificaties niet laden.');} }
    finally { if(alive.current) setLoading(false); }
  }
  useEffect(() => { alive.current=true; void loadStats(); return () => {alive.current=false;}; },[]);
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if(saved && typeof saved.title==='string' && typeof saved.body==='string' && typeof saved.url==='string') setDraft(saved); } catch { /* Ignore malformed drafts. */ }
    setDraftLoaded(true);
  },[]);
  useEffect(() => {
    if(!draftLoaded) return;
    try { if(hasDraft) localStorage.setItem(DRAFT_KEY,JSON.stringify(draft)); else localStorage.removeItem(DRAFT_KEY); setDraftStored(true); }
    catch { setDraftStored(false); }
  },[draft,draftLoaded,hasDraft]);

  function update(field: keyof Draft, value: string) { setDraft(current=>({...current,[field]:value}));setResult(null); }
  function replace(next: Draft) { setDraft(next);setResult(null);setConfirmation(null);setReplacement(null);setTab('compose');setSelectedLog(null);requestAnimationFrame(()=>titleRef.current?.focus()); }
  function requestReplace(next: Draft,label:string) { if(hasDraft) setReplacement({draft:next,label});else replace(next); }
  function insertEmoji(emoji:string) {
    const field=activeField.current, input=field==='title'?titleRef.current:bodyRef.current;
    const start=input?.selectionStart??draft[field].length, end=input?.selectionEnd??start;
    const value=`${draft[field].slice(0,start)}${emoji}${draft[field].slice(end)}`.slice(0,field==='title'?PUSH_TITLE_LIMIT:PUSH_BODY_LIMIT);
    update(field,value);requestAnimationFrame(()=>{input?.focus();input?.setSelectionRange(Math.min(start+emoji.length,value.length),Math.min(start+emoji.length,value.length));});
  }
  async function send() {
    if(!confirmation || sendLock.current || !canSend) return;
    sendLock.current=true;setSending(true);setError(null);setResult(null);
    try {
      const sent=await adminFunction<SendResult>('send-push',{...confirmation});
      if(alive.current) {
        setResult(sent);setConfirmation(null);
        // A completely failed attempt retains the message so it can be corrected.
        if(sent.sent>0) setDraft(emptyDraft);
        await loadStats();
      }
    } catch(cause) { if(alive.current) setError(cause instanceof Error?cause.message:'Verzenden mislukt. Je concept is bewaard.'); }
    finally {sendLock.current=false;if(alive.current)setSending(false);}
  }

  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">In contact met je bezoekers</p><h1>Notificaties</h1><p>Een relevante boodschap, rechtstreeks naar de toestellen van je abonnees.</p></div>
      <button className="workspace-button" disabled={loading||sending} onClick={()=>void loadStats()}><RefreshCw size={16} className={loading?'animate-spin':''}/>Vernieuwen</button>
    </div>
    <div className="workspace-stats workspace-communication-stats">
      <div className="workspace-stat"><span><Users size={15}/>Abonnementen</span><strong>{subscribers??'—'}</strong><small>Toestellen met toestemming voor push</small></div>
      <div className="workspace-stat"><span><History size={15}/>Recente verzendingen</span><strong>{statsReady?log.length:'—'}</strong><small>De laatste 25 berichten</small></div>
      <div className="workspace-stat"><span><Send size={15}/>Laatste verzending</span><strong className="workspace-stat-text">{log[0]?`${log[0].sent_count} / ${log[0].total_count}`:'—'}</strong><small>{log[0]?`${pushDeliveryLabel(log[0])} · ${dateLabel(log[0].created_at)}`:'Nog geen verzending geregistreerd'}</small></div>
    </div>
    <div className="workspace-view-bar"><div className="workspace-view-tabs" role="group" aria-label="Notificatieweergave">
      <button className={tab==='compose'?'is-active':''} aria-pressed={tab==='compose'} onClick={()=>setTab('compose')}><Bell size={15}/>Nieuw bericht{hasDraft&&<span className="workspace-draft-dot" aria-label="Concept aanwezig"/>}</button>
      <button className={tab==='history'?'is-active':''} aria-pressed={tab==='history'} onClick={()=>setTab('history')}><History size={15}/>Verzendhistoriek</button>
    </div><span className="workspace-updated">{updatedAt?`Bijgewerkt om ${new Date(updatedAt).toLocaleTimeString('nl-BE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Brussels'})}`:'Gegevens ophalen…'}</span></div>
    {error&&<p className="workspace-error" role="alert">{error}</p>}
    {result&&<div className={result.failed>0||result.sent===0?'workspace-notice is-warning':'workspace-success'} role="status">
      <strong>{result.sent===0?'Geen notificaties afgeleverd':result.failed>0?'Gedeeltelijk afgeleverd':'Notificatie afgeleverd'}</strong>
      <p>{result.sent} van {result.total} toestellen aanvaardden het bericht.{result.failed>0?` ${result.failed} afleveringen mislukten.`:''}{result.expired>0?` ${result.expired} verlopen abonnementen zijn opgeruimd.`:''}</p>
      <p>Aflevering bevestigt geen geopende notificatie.{result.sent===0?' Je concept is bewaard.':''}</p>
    </div>}
    {tab==='compose'?<div className="workspace-push-grid">
      <form className="workspace-panel workspace-push-composer" onSubmit={event=>{event.preventDefault();if(canSend)setConfirmation({title:draft.title.trim(),body:draft.body.trim(),url:normalizedUrl});}}>
        <div className="workspace-section-heading"><h2>Je bericht</h2><span className="workspace-status">{hasDraft?(draftStored?'Concept bewaard':'Concept niet bewaard'):'Nieuw concept'}</span></div>
        <p className="workspace-muted">Schrijf eerst je boodschap. Controleer daarna wie ze ontvangt en waar ze naartoe leidt.</p>
        <div className="workspace-push-template"><Sparkles size={16}/><select aria-label="Begin met een sjabloon" value="" disabled={sending} onChange={event=>{const template=templates[Number(event.target.value)];if(template)requestReplace({title:template.title,body:template.body,url:template.url},template.label);}}><option value="">Begin met een sjabloon</option>{templates.map((t,i)=><option key={t.label} value={i}>{t.label}</option>)}</select></div>
        <fieldset className="workspace-form workspace-push-fields" disabled={sending}>
          <label><span className="workspace-field-label">Titel <small>{draft.title.length}/{PUSH_TITLE_LIMIT}</small></span><input ref={titleRef} name="push-title" value={draft.title} maxLength={PUSH_TITLE_LIMIT} onFocus={()=>{activeField.current='title';}} onChange={e=>update('title',e.target.value)} placeholder="Wat wil je je bezoekers vertellen?" required/></label>
          <label><span className="workspace-field-label">Bericht <small>{draft.body.length}/{PUSH_BODY_LIMIT}</small></span><textarea ref={bodyRef} name="push-body" rows={4} value={draft.body} maxLength={PUSH_BODY_LIMIT} onFocus={()=>{activeField.current='body';}} onChange={e=>update('body',e.target.value)} placeholder="Hou het kort, duidelijk en relevant."/><small>Een korte tekst leest het prettigst op een telefoon.</small></label>
          <details className="workspace-push-emojis"><summary>Emoji toevoegen</summary><p>Wordt ingevoegd in het laatst gebruikte tekstveld.</p><div>{emojis.map(emoji=><button type="button" key={emoji} aria-label={`${emoji} invoegen`} onClick={()=>insertEmoji(emoji)}>{emoji}</button>)}</div></details>
          <label>Openen na een tik<select aria-label="Kies een bestemmingspagina" value={destinations.some(d=>d.value===draft.url)?draft.url:'custom'} onChange={e=>update('url',e.target.value==='custom'?'':e.target.value)}>{destinations.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}<option value="custom">Andere pagina of externe website</option></select><input name="push-url" aria-label="Bestemmingslink" value={draft.url} maxLength={2048} onChange={e=>update('url',e.target.value)} placeholder="/blog/artikel of https://…" aria-invalid={!!urlError} aria-describedby="push-url-help"/><small id="push-url-help" className={urlError?'workspace-field-error':''}>{urlError||`Bestemming: ${normalizedUrl}`}</small></label>
        </fieldset>
        <div className="workspace-composer-footer"><span><Check size={14}/>{hasDraft?(draftStored?'Automatisch bewaard op dit toestel':'Bewaren op dit toestel is niet beschikbaar'):'Je concept wordt automatisch bewaard'}</span><button type="button" className="workspace-text-link" disabled={!hasDraft||sending} onClick={()=>requestReplace(emptyDraft,'Leeg concept')}><Trash2 size={14}/>Concept wissen</button></div>
        <div className="workspace-push-submit"><button type="submit" className="workspace-button workspace-button-primary" disabled={!canSend}><ChevronRight size={16}/>Controleren en versturen</button><p>{!statsReady?'Laad de ontvangers voordat je verstuurt.':subscribers===0?'Er zijn nog geen pushabonnementen.':'Verzenden gebeurt pas na je laatste controle.'}</p></div>
      </form>
      <aside className="workspace-push-aside">
        <section className="workspace-panel"><div className="workspace-section-heading"><h2><Smartphone size={17}/>Voorvertoning</h2><span className="workspace-status">Live</span></div><NotificationPreview draft={draft}/><p className="workspace-muted">De weergave kan verschillen per toestel. Lange berichten kunnen ingekort worden.</p>
          <div className="workspace-push-destination"><span>Na een tik</span>{!urlError?<a href={normalizedUrl} target="_blank" rel="noopener noreferrer">{normalizedUrl}<ExternalLink size={13}/></a>:<span className="workspace-field-error">Vul een geldige bestemming in</span>}</div>
        </section>
        <section className="workspace-panel workspace-push-audience"><span className="workspace-task-icon"><Users size={19}/></span><h2>Je huidige abonnees</h2><p>Dit bericht gaat naar alle {subscribers??'…'} geregistreerde pushabonnementen. Eén persoon kan meerdere toestellen gebruiken.</p><div><Check size={14}/><span>Alleen bezoekers die toestemming gaven</span></div><p className="workspace-note">Push is geen e-mail. Je ledenlijst en je pushabonnementen zijn afzonderlijk.</p></section>
      </aside>
    </div>:<div className={`workspace-operations-grid${selectedLog?' has-detail':''}`}>
      <section className="workspace-panel workspace-push-history"><div className="workspace-section-heading"><h2>Verzendhistoriek</h2><span className="workspace-muted">{filteredLog.length} berichten</span></div>
        <label className="workspace-search workspace-operations-search"><Search size={16}/><input type="search" aria-label="Zoek in verzendhistoriek" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Zoek op titel, bericht of bestemming"/></label>
        {loading&&!statsReady?<div className="workspace-empty" role="status"><Loader2 className="animate-spin"/>Historiek laden…</div>:filteredLog.length?<div className="workspace-dispatch-list">{filteredLog.map(entry=><button key={entry.id} className={`workspace-dispatch-row${selectedLog?.id===entry.id?' is-selected':''}`} aria-pressed={selectedLog?.id===entry.id} onClick={()=>setSelectedLog(entry)}>
          <span className="workspace-dispatch-icon"><Send size={16}/></span><span className="workspace-dispatch-copy"><strong>{entry.title}</strong><small>{dateLabel(entry.created_at)}</small><span className={`workspace-operation-status${entry.failed_count>0||entry.sent_count===0?' is-warning':' is-success'}`}>{pushDeliveryLabel(entry)}</span></span><span className="workspace-dispatch-count"><strong>{entry.sent_count}<small> / {entry.total_count}</small></strong><small>afgeleverd</small></span><ChevronRight size={16}/>
        </button>)}</div>:<div className="workspace-empty"><History size={26}/><h2>{search?'Geen berichten gevonden':'Nog geen verzendingen'}</h2><p>{search?'Probeer een andere zoekterm.':'Je verstuurde berichten verschijnen hier met hun afleverresultaat.'}</p>{search&&<button className="workspace-button" onClick={()=>setSearch('')}>Zoekopdracht wissen</button>}</div>}
        <p className="workspace-note">De laatste 25 verzendingen. Afgeleverd betekent aanvaard door de pushdienst, geen bevestiging dat iemand het bericht las.</p>
      </section>
      {selectedLog&&<section className="workspace-panel workspace-operation-detail"><div className="workspace-section-heading"><h2>Verzonden bericht</h2><button className="workspace-text-link" onClick={()=>setSelectedLog(null)}>Sluiten</button></div><p className="workspace-muted">{dateLabel(selectedLog.created_at)}</p><NotificationPreview placeholder={false} draft={{title:selectedLog.title,body:selectedLog.body||'',url:selectedLog.url||'/'}}/>
        <dl className="workspace-operation-facts"><div><dt>Afgeleverd</dt><dd>{selectedLog.sent_count}</dd></div><div><dt>Mislukt</dt><dd>{selectedLog.failed_count}</dd></div><div><dt>Totaal geprobeerd</dt><dd>{selectedLog.total_count}</dd></div><div><dt>Bestemming</dt><dd>{pushUrlError(selectedLog.url||'/')?<span>{selectedLog.url}</span>:<a href={normalizePushUrl(selectedLog.url||'/')} target="_blank" rel="noopener noreferrer">{selectedLog.url||'/'}<ExternalLink size={12}/></a>}</dd></div></dl>
        <button className="workspace-button" onClick={()=>requestReplace({title:selectedLog.title,body:selectedLog.body||'',url:selectedLog.url||'/'},'Bericht hergebruiken')}><Copy size={15}/>Als nieuw concept gebruiken</button><p className="workspace-note">Dit opent de editor. Het bericht wordt niet opnieuw verstuurd.</p>
      </section>}
    </div>}
    <AdminDialog open={!!confirmation} title="Controleer je notificatie" busy={sending} onCancel={()=>setConfirmation(null)} actions={<><button type="button" autoFocus className="workspace-button" disabled={sending} onClick={()=>setConfirmation(null)}>Terug naar bericht</button><button type="button" className="workspace-button workspace-button-primary" disabled={!canSend||sending} onClick={()=>void send()}>{sending?<Loader2 size={16} className="animate-spin"/>:<Send size={16}/>} {sending?'Versturen…':'Nu versturen'}</button></>}>
      {confirmation&&<><p>Je verstuurt dit bericht naar je huidige <strong>{subscribers} pushabonnementen</strong>. Het aantal kan nog wijzigen wanneer iemand zich inschrijft of uitschrijft.</p><NotificationPreview placeholder={false} draft={confirmation}/><dl className="workspace-operation-facts"><div><dt>Bestemming</dt><dd>{confirmation.url}</dd></div></dl><p>Een verzonden pushbericht kun je niet terughalen.</p>{error&&<p className="workspace-error" role="alert">{error}</p>}</>}
    </AdminDialog>
    <AdminDialog open={!!replacement} title="Huidig concept vervangen?" onCancel={()=>setReplacement(null)} actions={<><button autoFocus className="workspace-button" onClick={()=>setReplacement(null)}>Concept behouden</button><button className="workspace-button workspace-button-primary" onClick={()=>{if(replacement)replace(replacement.draft);}}>Concept vervangen</button></>}><p>Je hebt al een concept. Met ‘{replacement?.label}’ vervang je de huidige titel, tekst en bestemming.</p></AdminDialog>
  </>;
}
