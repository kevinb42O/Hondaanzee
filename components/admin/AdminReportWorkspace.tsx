import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ArrowUpRight, Check, CheckCircle2, ChevronRight, Eye, EyeOff, Flag, Inbox, Loader2, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ReportInterventionStatus, ReportItem } from '../../types.ts';
import { fetchAdminReports, removeAdminReport, updateAdminReportStatus } from '../../utils/reportData.ts';
import { formatObservedAbsolute, getCategoryMeta, REPORT_CATEGORY_META } from '../../utils/reportHelpers.ts';
import { getReportDetailPath } from '../../utils/reportRoutes.ts';
import AdminDialog from './AdminDialog.tsx';

const statusLabels: Record<ReportInterventionStatus,string> = {not_applicable:'Geen opvolging',pending:'Wacht op update',forwarded:'Doorgestuurd',resolved:'Opgelost'};
const statusOptions = [{value:'not_applicable',label:'Niet van toepassing'},{value:'pending',label:'Wacht op update'},{value:'forwarded',label:'Doorgestuurd'},{value:'resolved',label:'Opgeruimd / opgelost'}];
type View = 'active'|'attention'|'resolved'|'hidden'|'all'|'removed';
interface Edit { status: ReportInterventionStatus; note: string; baselineStatus: ReportInterventionStatus; baselineNote: string }
function matchesView(report:ReportItem,view:View) {
  if(view==='all') return true;
  if(view==='removed') return report.status==='removed';
  if(report.status==='removed') return false;
  if(view==='attention') return report.city_intervention_status!=='resolved'||report.is_hidden||report.report_count>0;
  if(view==='resolved') return report.city_intervention_status==='resolved';
  if(view==='hidden') return report.is_hidden;
  return true;
}
function ReportStatus({report}:{report:ReportItem}) {return <span className={`workspace-operation-status${report.status==='removed'?'':report.city_intervention_status==='resolved'?' is-success':report.city_intervention_status==='pending'?' is-warning':report.city_intervention_status==='forwarded'?' is-info':''}`}>{report.status==='removed'?'Uit meldpunt gehaald':statusLabels[report.city_intervention_status]}</span>;}

/** Shared workbench keeps the active queue and its archive in one dashboard language. */
export default function AdminReportWorkspace({ history=false }: { history?:boolean }) {
  const [params,setParams]=useSearchParams();
  const initialView=history?'all':'active';
  const requestedView=params.get('view') as View;
  const view:View=(history?['all','active','resolved','hidden','removed']:['active','attention','resolved','hidden']).includes(requestedView)?requestedView:initialView;
  const selectedId=params.get('report');
  const [reports,setReports]=useState<ReportItem[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [success,setSuccess]=useState<string|null>(null);
  const [search,setSearch]=useState('');
  const [city,setCity]=useState('all');
  const [category,setCategory]=useState('all');
  const [status,setStatus]=useState('all');
  const [page,setPage]=useState(1);
  const [edits,setEdits]=useState<Record<string,Edit>>({});
  const [busy,setBusy]=useState(false);
  const [confirmArchive,setConfirmArchive]=useState<ReportItem|null>(null);
  const [pendingSelection,setPendingSelection]=useState<string|undefined>(undefined);
  const [refreshConfirm,setRefreshConfirm]=useState(false);
  const detailRef=useRef<HTMLElement>(null);
  const rowRefs=useRef<Record<string,HTMLButtonElement|null>>({});
  const searchRef=useRef<HTMLInputElement>(null);
  const alive=useRef(true);
  const operationLock=useRef(false);
  const selected=reports.find(report=>report.public_id===selectedId);
  const edit=selected?edits[selected.public_id]:undefined;
  const currentStatus=edit?.status??selected?.city_intervention_status??'not_applicable';
  const currentNote=edit?.note??selected?.city_intervention_note??'';
  const dirty=!!selected&&(currentStatus!==selected.city_intervention_status||currentNote!==(selected.city_intervention_note||''));
  const conflict=!!edit&&!!selected&&(edit.baselineStatus!==selected.city_intervention_status||edit.baselineNote!==(selected.city_intervention_note||''));
  const draftKey='haz-report-admin-drafts-v1';

  async function load() {
    setLoading(true);setError(null);
    try {const data=await fetchAdminReports();if(alive.current){setReports(data);setLoaded(true);}}
    catch(cause){if(alive.current)setError(cause instanceof Error?cause.message:'Kon meldingen niet laden.');}
    finally{if(alive.current)setLoading(false);}
  }
  useEffect(()=>{alive.current=true;void load();return()=>{alive.current=false;};},[]);
  useEffect(()=>{
    if(history)return;
    try {const stored=JSON.parse(sessionStorage.getItem(draftKey)||'{}');const valid:Record<string,Edit>={};Object.entries(stored).forEach(([id,value])=>{const e=value as Edit;if(e&&typeof e.note==='string'&&typeof e.baselineNote==='string'&&Object.hasOwn(statusLabels,e.status)&&Object.hasOwn(statusLabels,e.baselineStatus))valid[id]=e;});setEdits(valid);}catch{/* Invalid session drafts are ignored. */}
  },[history]);
  useEffect(()=>{if(history)return;try{sessionStorage.setItem(draftKey,JSON.stringify(edits));}catch{/* Unload warning still protects unsaved edits. */}},[edits,history]);
  useEffect(()=>{const unsaved=Object.keys(edits).length>0;if(!unsaved)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[edits]);
  useEffect(()=>{setPage(1);},[search,city,category,status,view]);
  const cities=useMemo(()=>Array.from(new Set(reports.map(r=>r.city_name))).sort((a,b)=>a.localeCompare(b,'nl')),[reports]);
  const filtered=useMemo(()=>reports.filter(report=>matchesView(report,view)).filter(report=>city==='all'||report.city_name===city).filter(report=>category==='all'||report.category===category).filter(report=>status==='all'||report.city_intervention_status===status).filter(report=>`${report.location_text} ${report.description} ${report.city_name} ${report.public_id} ${report.city_intervention_note||''}`.toLocaleLowerCase('nl').includes(search.trim().toLocaleLowerCase('nl'))).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()),[reports,view,city,category,status,search]);
  const maxPage=Math.max(1,Math.ceil(filtered.length/15));
  const displayPage=Math.min(page,maxPage);
  const shown=filtered.slice((displayPage-1)*15,displayPage*15);
  const filtersActive=!!search||city!=='all'||category!=='all'||status!=='all';
  const views:Array<{value:View;label:string}>=history?[{value:'all',label:'Alles'},{value:'active',label:'Actief'},{value:'resolved',label:'Opgelost'},{value:'hidden',label:'Verborgen'},{value:'removed',label:'Uit meldpunt gehaald'}]:[{value:'active',label:'Actief'},{value:'attention',label:'Aandacht nodig'},{value:'resolved',label:'Opgelost'},{value:'hidden',label:'Verborgen'}];

  function updateParam(key:string,value:string|null){setParams(current=>{const next=new URLSearchParams(current);if(value)next.set(key,value);else next.delete(key);return next;},{replace:true});}
  function choose(id:string|null){const opener=selectedId?rowRefs.current[selectedId]:null;updateParam('report',id);setSuccess(null);requestAnimationFrame(()=>{if(!id){(opener||searchRef.current)?.focus();return;}detailRef.current?.focus();if(matchMedia('(max-width:1100px)').matches)detailRef.current?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});});}
  function requestChoose(id:string|null){if(busy)return;if(dirty&&id!==selectedId)setPendingSelection(id||'');else choose(id);}
  function setEdit(patch:Partial<Pick<Edit,'status'|'note'>>){if(!selected)return;setSuccess(null);setEdits(current=>{const original=current[selected.public_id]||{status:selected.city_intervention_status,note:selected.city_intervention_note||'',baselineStatus:selected.city_intervention_status,baselineNote:selected.city_intervention_note||''};const next={...original,...patch};const result={...current};if(next.status===selected.city_intervention_status&&next.note===(selected.city_intervention_note||''))delete result[selected.public_id];else result[selected.public_id]=next;return result;});}
  function discard(){if(!selected)return;setEdits(current=>{const result={...current};delete result[selected.public_id];return result;});}
  async function save(){if(!selected||!dirty||conflict||operationLock.current)return;operationLock.current=true;setBusy(true);setError(null);setSuccess(null);const report=selected;
    try {const saved=await updateAdminReportStatus(report.public_id,currentStatus,currentNote.trim());if(alive.current){setReports(current=>current.map(r=>r.public_id===report.public_id?{...r,...saved}:r));setEdits(current=>{const next={...current};delete next[report.public_id];return next;});setSuccess('Opvolging opgeslagen. De status en terugkoppeling zijn ook aangepast op de publieke melding.');}}
    catch(cause){if(alive.current)setError(cause instanceof Error?cause.message:'Opslaan mislukt. Je wijzigingen zijn behouden.');}
    finally{operationLock.current=false;if(alive.current)setBusy(false);}
  }
  async function archive(){if(!confirmArchive||operationLock.current)return;operationLock.current=true;setBusy(true);setError(null);const report=confirmArchive;
    try{await removeAdminReport(report.public_id);if(alive.current){setReports(current=>current.map(r=>r.public_id===report.public_id?{...r,status:'removed',is_hidden:true}:r));setConfirmArchive(null);setSuccess('De melding staat niet meer op de publieke site. De oorspronkelijke inhoud blijft bewaard in het logboek.');setEdits(current=>{const next={...current};delete next[report.public_id];return next;});}}
    catch(cause){if(alive.current)setError(cause instanceof Error?cause.message:'Kon melding niet uit het meldpunt halen.');}
    finally{operationLock.current=false;if(alive.current)setBusy(false);}
  }
  const resetFilters=()=>{setSearch('');setCity('all');setCategory('all');setStatus('all');};
  const activeCount=reports.filter(r=>r.status!=='removed').length;
  const removedCount=reports.length-activeCount;

  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">{history?'Bewaarde meldingen':'Een veilige dag aan zee'}</p><h1>{history?'Logboek':'Meldpunt'}</h1><p>{history?'Alle meldingen en hun huidige status, ook nadat ze van de website zijn gehaald.':'Bekijk signalen van bezoekers en geef elke melding een duidelijke opvolging.'}</p></div>
      <div className="workspace-heading-actions"><Link className="workspace-button" to={history?'/admin/meldpunt':'/admin/log'}>{history?<Inbox size={16}/>:<Archive size={16}/>} {history?'Naar meldpunt':'Logboek'}</Link><button className="workspace-button" disabled={loading||busy} onClick={()=>{if(Object.keys(edits).length)setRefreshConfirm(true);else void load();}}><RefreshCw size={16} className={loading?'animate-spin':''}/>Vernieuwen</button></div>
    </div>
    <div className="workspace-stats workspace-report-stats">
      {[{label:'Actieve meldingen',value:activeCount,sub:'Niet uit de website gehaald',icon:Inbox},{label:'Opvolging nodig',value:reports.filter(r=>r.status!=='removed'&&r.city_intervention_status!=='resolved').length,sub:'Nog niet als opgelost gemarkeerd',icon:ShieldCheck},{label:'Gemarkeerd',value:reports.filter(r=>r.status!=='removed'&&(r.report_count>0||r.is_hidden)).length,sub:'Door bezoekers gemeld of verborgen',icon:Flag},{label:'In het logboek',value:removedCount,sub:'Uit het publieke meldpunt gehaald',icon:Archive}].map(({label,value,sub,icon:Icon})=><div className="workspace-stat" key={label}><span><Icon size={15}/>{label}</span><strong>{loaded?value:'—'}</strong><small>{sub}</small></div>)}
    </div>
    {error&&<p className="workspace-error" role="alert">{error}</p>}{success&&<p className="workspace-success" role="status">{success}</p>}
    <div className={`workspace-operations-grid workspace-reports-grid${selectedId?' has-detail':''}`}>
      <section className="workspace-panel workspace-report-list" aria-label={history?'Meldingen in logboek':'Meldingenlijst'} aria-busy={loading}>
        <div className="workspace-view-tabs workspace-report-tabs" role="group" aria-label="Meldingenweergave">{views.map(item=><button key={item.value} aria-pressed={view===item.value} className={view===item.value?'is-active':''} disabled={busy} onClick={()=>updateParam('view',item.value)}>{item.label}<span>{reports.filter(r=>matchesView(r,item.value)).length}</span></button>)}</div>
        <label className="workspace-search workspace-operations-search"><Search size={16}/><input ref={searchRef} type="search" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Zoek meldingen" placeholder="Zoek op locatie, gemeente of beschrijving"/></label>
        <div className="workspace-report-filters"><label>Gemeente<select aria-label="Gemeente" value={city} onChange={e=>setCity(e.target.value)}><option value="all">Alle gemeenten</option>{cities.map(c=><option key={c}>{c}</option>)}</select></label><label>Categorie<select aria-label="Categorie" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Alle categorieën</option>{Object.entries(REPORT_CATEGORY_META).map(([id,meta])=><option key={id} value={id}>{meta.label}</option>)}</select></label><label>Opvolgstatus<select aria-label="Opvolgstatus" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Alle statussen</option>{statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label></div>
        <div className="workspace-report-results"><span>{filtered.length} {filtered.length===1?'melding':'meldingen'}{loading&&loaded?' · vernieuwen…':''}</span>{filtersActive&&<button className="workspace-text-link" onClick={resetFilters}>Filters wissen</button>}</div>
        {loading&&!loaded?<div className="workspace-empty" role="status"><Loader2 className="animate-spin"/>Meldingen laden…</div>:shown.length?<div className="workspace-report-rows">{shown.map(report=>{const Icon=getCategoryMeta(report.category).icon;return <button ref={element=>{rowRefs.current[report.public_id]=element;}} key={report.public_id} className={`workspace-report-row${selectedId===report.public_id?' is-selected':''}`} aria-pressed={selectedId===report.public_id} aria-label={`Bekijk melding: ${report.location_text}`} disabled={busy} onClick={()=>requestChoose(report.public_id)}>
          <span className="workspace-report-icon"><Icon size={18}/></span><span className="workspace-report-row-copy"><span className="workspace-report-row-top"><strong>{report.location_text}</strong><ChevronRight size={16}/></span><small>{report.city_name} · {getCategoryMeta(report.category).label}</small><p>{report.description}</p><span className="workspace-report-row-meta"><ReportStatus report={report}/>{report.status!=='removed'&&report.is_hidden&&<span className="workspace-operation-status is-warning"><EyeOff size={11}/>Verborgen</span>}{report.report_count>0&&<span title="Aantal keren als ongepast gemeld"><Flag size={12}/>{report.report_count}</span>}<time dateTime={report.observed_at}>{formatObservedAbsolute(report.observed_at)}</time></span></span>
        </button>;})}</div>:<div className="workspace-empty workspace-report-empty"><span className="workspace-empty-emblem">{history?<Archive size={25}/>:<CheckCircle2 size={25}/>}</span><h2>{!loaded&&error?'Meldingen niet beschikbaar':filtersActive?'Geen passende meldingen':history?'Geen meldingen in deze weergave':view==='active'?'Geen actieve meldingen':view==='attention'?'Geen meldingen die aandacht vragen':'Geen meldingen in deze weergave'}</h2><p>{!loaded&&error?'Probeer de gegevens opnieuw te laden.':filtersActive?'Pas je filters aan om andere meldingen te zien.':!history&&activeCount===0?'Nieuwe meldingen verschijnen hier zodra een bezoeker ze instuurt. Eerdere meldingen blijven in het logboek bewaard.':'Kies een andere weergave om je overige meldingen te bekijken.'}</p>{filtersActive?<button className="workspace-button" onClick={resetFilters}>Filters wissen</button>:!history&&removedCount>0?<Link className="workspace-button" to="/admin/log"><Archive size={15}/>Bekijk {removedCount} eerdere meldingen</Link>:!loaded&&error?<button className="workspace-button" onClick={()=>void load()}>Opnieuw proberen</button>:view!==initialView?<button className="workspace-button" onClick={()=>updateParam('view',initialView)}>Alle meldingen bekijken</button>:null}</div>}
        {maxPage>1&&<div className="workspace-operation-pagination"><button className="workspace-button" disabled={displayPage===1} onClick={()=>setPage(displayPage-1)}>Vorige</button><span>{displayPage} / {maxPage}</span><button className="workspace-button" disabled={displayPage===maxPage} onClick={()=>setPage(displayPage+1)}>Volgende</button></div>}
        {reports.length>=100&&<p className="workspace-note">Dit overzicht bevat de laatste 100 meldingen. De tellingen en filters gelden voor die geladen meldingen.</p>}
      </section>
      {selectedId&&<section className="workspace-panel workspace-operation-detail workspace-report-detail" ref={detailRef} tabIndex={-1} aria-label="Meldingdetails">
        <div className="workspace-section-heading"><span className="workspace-eyebrow">Meldingdetails</span><button className="workspace-icon-button" aria-label="Meldingdetails sluiten" disabled={busy} onClick={()=>requestChoose(null)}><X size={16}/></button></div>
        {selected?<><div className="workspace-report-detail-heading"><span className="workspace-task-icon">{React.createElement(getCategoryMeta(selected.category).icon,{size:21})}</span><div><h2>{selected.location_text}</h2><p className="workspace-muted">{selected.city_name} · {getCategoryMeta(selected.category).label}</p></div></div><div className="workspace-report-detail-status"><ReportStatus report={selected}/><span className="workspace-operation-status">{selected.status==='removed'?<Archive size={12}/>:selected.is_hidden?<EyeOff size={12}/>:<Eye size={12}/>} {selected.status==='removed'?'Bewaard in logboek':selected.is_hidden?'Niet publiek zichtbaar':'Publiek zichtbaar'}</span></div>
          <p className="workspace-report-description">{selected.description}</p>
          <dl className="workspace-operation-facts"><div><dt>Waargenomen</dt><dd>{formatObservedAbsolute(selected.observed_at)}</dd></div><div><dt>Ingestuurd</dt><dd>{formatObservedAbsolute(selected.created_at)}</dd></div><div><dt>Bevestigingen</dt><dd>{selected.confirm_count}</dd></div><div><dt>Als ongepast gemeld</dt><dd>{selected.report_count}</dd></div></dl>
          {selected.report_count>0&&<div className="workspace-notice is-warning"><Flag size={15}/><p>Bezoekers hebben deze melding {selected.report_count} keer als ongepast gemeld.{selected.is_hidden&&selected.status!=='removed'?' De melding is verborgen.':''} Bekijk de oorspronkelijke inhoud vóór je een beslissing neemt.</p></div>}
          {selected.status==='removed'?<div className="workspace-notice"><Archive size={17}/><p>Deze melding staat niet meer op de website. De oorspronkelijke tekst, opvolging en gegevens blijven hier bewaard.</p></div>:!selected.is_hidden?<Link className="workspace-text-link" to={getReportDetailPath(selected.public_id)} target="_blank">Publieke melding bekijken<ArrowUpRight size={14}/></Link>:<p className="workspace-note">Verborgen meldingen hebben geen zichtbare publieke detailpagina.</p>}
          {!history&&selected.status!=='removed'?<form className="workspace-report-followup" onSubmit={e=>{e.preventDefault();void save();}}><div className="workspace-section-heading"><h3>Opvolging</h3>{dirty&&<span className="workspace-operation-status is-warning">Niet opgeslagen</span>}</div><p className="workspace-muted">Status en terugkoppeling verschijnen ook op de publieke melding.</p><fieldset className="workspace-form" disabled={busy}><label>Officiële opvolgstatus<select value={currentStatus} onChange={e=>setEdit({status:e.target.value as ReportInterventionStatus})}>{statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label><label><span className="workspace-field-label">Publieke terugkoppeling<small>{currentNote.length}/300</small></span><textarea rows={4} value={currentNote} maxLength={300} onChange={e=>setEdit({note:e.target.value})} placeholder="Bijvoorbeeld: doorgestuurd naar de stadsdiensten."/><small>Deze tekst is openbaar. Voeg geen persoonlijke of interne gegevens toe.</small></label><details className="workspace-report-phrases"><summary>Korte terugkoppeling invoegen</summary>{['Melding ontvangen door bevoegde dienst.','Doorgestuurd naar stadsdiensten.','Ter plaatse nagekeken.','Opgeruimd door stadsdiensten.'].map(phrase=><button key={phrase} type="button" onClick={()=>setEdit({note:`${currentNote}${currentNote?'\n':''}${phrase}`.slice(0,300)})}>{phrase}</button>)}</details></fieldset>
            {conflict&&<p className="workspace-notice is-warning">De opgeslagen opvolging is intussen veranderd. Je concept blijft bewaard. Neem de actuele versie over voordat je opnieuw bewerkt.</p>}
            <div className="workspace-report-save"><button className="workspace-button workspace-button-primary" type="submit" disabled={!dirty||busy||conflict}>{busy?<Loader2 size={15} className="animate-spin"/>:<Check size={15}/>}Opvolging opslaan</button>{dirty&&<button type="button" className="workspace-text-link" disabled={busy} onClick={discard}>{conflict?'Actuele versie overnemen':'Wijzigingen terugzetten'}</button>}</div>
            <div className="workspace-report-archive"><h3>Uit het meldpunt halen</h3><p>De melding verdwijnt van de publieke site en blijft bewaard in het logboek.</p><button className="workspace-button" type="button" disabled={busy} onClick={()=>setConfirmArchive(selected)}><Archive size={15}/>Uit meldpunt halen</button></div>
          </form>:<div className="workspace-report-record"><h3>Opvolging</h3><p>{statusLabels[selected.city_intervention_status]}</p>{selected.city_intervention_note&&<blockquote>{selected.city_intervention_note}</blockquote>}{selected.resolved_at&&<p className="workspace-muted">Als opgelost gemarkeerd op {formatObservedAbsolute(selected.resolved_at)}</p>}{history&&selected.status!=='removed'&&<Link className="workspace-button" to={`/admin/meldpunt?report=${encodeURIComponent(selected.public_id)}`}><ShieldCheck size={15}/>Opvolging beheren</Link>}</div>}
          <details className="workspace-report-reference"><summary>Referentiegegevens</summary><dl className="workspace-operation-facts"><div><dt>Meldingsnummer</dt><dd>{selected.public_id}</dd></div><div><dt>Gemeente</dt><dd>{selected.city_name}</dd></div></dl></details>
        </>:<div className="workspace-empty"><Inbox size={24}/><h2>{loading?'Melding laden…':'Melding niet gevonden'}</h2><p>Deze melding zit niet in het geladen overzicht. Sluit het detailpaneel of vernieuw de lijst.</p></div>}
      </section>}
    </div>
    {history&&<p className="workspace-note">Dit logboek toont bewaarde meldingen en hun huidige status. Het is geen volledig overzicht van elke wijziging.</p>}
    <AdminDialog open={!!confirmArchive} title="Melding uit het meldpunt halen?" busy={busy} onCancel={()=>setConfirmArchive(null)} actions={<><button autoFocus className="workspace-button" disabled={busy} onClick={()=>setConfirmArchive(null)}>Melding behouden</button><button className="workspace-button workspace-button-primary" disabled={busy} onClick={()=>void archive()}>{busy?<Loader2 size={15} className="animate-spin"/>:<Archive size={15}/>}Uit meldpunt halen</button></>}><p><strong>{confirmArchive?.location_text}</strong> in {confirmArchive?.city_name} verdwijnt van de publieke website. De oorspronkelijke melding blijft bewaard in het logboek.</p>{dirty&&<p className="workspace-notice is-warning">Je niet opgeslagen wijzigingen in de opvolging worden hierbij niet toegepast.</p>}{error&&<p className="workspace-error" role="alert">{error}</p>}</AdminDialog>
    <AdminDialog open={pendingSelection!==undefined} title="Je opvolging is nog niet opgeslagen" onCancel={()=>setPendingSelection(undefined)} actions={<><button autoFocus className="workspace-button" onClick={()=>setPendingSelection(undefined)}>Verder bewerken</button><button className="workspace-button workspace-button-primary" onClick={()=>{choose(pendingSelection||null);setPendingSelection(undefined);}}>Verder zonder opslaan</button></>}><p>Je wijzigingen blijven als concept bewaard in dit browsertabblad. Ze zijn nog niet zichtbaar op de publieke site. Je kunt ze later opnieuw openen en opslaan.</p></AdminDialog>
    <AdminDialog open={refreshConfirm} title="Meldingen vernieuwen?" onCancel={()=>setRefreshConfirm(false)} actions={<><button autoFocus className="workspace-button" onClick={()=>setRefreshConfirm(false)}>Terug naar wijzigingen</button><button className="workspace-button workspace-button-primary" onClick={()=>{setRefreshConfirm(false);void load();}}>Vernieuwen</button></>}><p>Je concepten blijven behouden. Als de opgeslagen opvolging ondertussen veranderd is, kun je die eerst vergelijken voordat je opslaat.</p></AdminDialog>
  </>;
}
