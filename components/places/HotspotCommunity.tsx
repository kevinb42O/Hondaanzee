import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, Loader2, MessageSquare, Pencil, Star, ThumbsUp, Trash2, Flag } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient.ts';
import { useMember } from '../member/MemberProvider.tsx';
import { MemberDialog } from '../member/MemberUI.tsx';
import StarRating from '../StarRating.tsx';
import { clearCommunityIntent, hotspotAction, hotspotKey, readCommunityIntent, rememberCommunityIntent, reviewScore, reviewStatus, updateHotspotSummary, useHotspotSummary, type HotspotMemberState, type HotspotRef, type HotspotReview, type HotspotSummary, type OwnReview } from '../../utils/hotspotCommunity.ts';
import './HotspotCommunity.css';

type Context = { place:HotspotRef; name:string; own:HotspotMemberState|null; loading:boolean; error:string; busy:boolean; refresh:()=>Promise<void>; review:()=>void; like:()=>Promise<void>; formOpen:boolean; closeForm:()=>void; setOwn:(state:HotspotMemberState)=>void; notice:string; notify:(text:string)=>void; feedbackHero:boolean };
const CommunityContext=createContext<Context|null>(null);
const useCommunity=()=>{const value=useContext(CommunityContext);if(!value)throw new Error('Missing hotspot context');return value;};

export function HotspotCommunityProvider({place,name,enabled,children}:{place:HotspotRef;name:string;enabled:boolean;children:React.ReactNode}) {
 const member=useMember(),location=useLocation(),key=hotspotKey(place);
 const active=enabled&&member.data?.profile.status==='active';
 const owner=active?member.data!.profile.id:null;
 const currentOwner=useRef(owner);currentOwner.current=owner;
 const sequence=useRef(0),likeLock=useRef(false),handledIntent=useRef('');
 const [own,setOwn]=useState<HotspotMemberState|null>(null),[loadedOwner,setLoadedOwner]=useState<string|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[formOpen,setFormOpen]=useState(false),[gate,setGate]=useState<'like'|'review'|null>(null),[notice,setNotice]=useState('');
 const [feedbackHero,setFeedbackHero]=useState(true);
 const {refresh:refreshSummary}=useHotspotSummary(place,enabled);
 const setOwned=(state:HotspotMemberState)=>{setLoadedOwner(owner);setOwn(state);};
 const refresh=async()=>{
  const request=++sequence.current;
  if(!owner){setOwn(null);setLoading(false);return;}
  setLoading(true);setError('');
  try{const state=await hotspotAction({action:'state',...place});if(request===sequence.current&&currentOwner.current===owner)setOwned(state);}
  catch(e){if(request===sequence.current)setError((e as Error).message);}
  finally{if(request===sequence.current)setLoading(false);}
 };
 useEffect(()=>{setOwn(null);setFormOpen(false);setGate(null);setError('');setNotice('');void refresh();return()=>{sequence.current++;};},[owner,key]);
 useEffect(()=>{
  if(!owner)return;const focus=()=>{if(!document.hidden&&!likeLock.current)void refresh();};
  window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
  return()=>{window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);};
 },[owner,key]);
 const like=async(desired?:boolean)=>{
  if(!owner){setGate('like');return;}
  if(likeLock.current||loading||!own)return;
  likeLock.current=true;setBusy(true);setError('');setNotice('');setFeedbackHero(true);const actor=owner;
  try{
   const result=await hotspotAction({action:'like',...place,liked:desired??!own.liked});
   if(currentOwner.current!==actor)return;
   sequence.current++;setOwned(result);if(result.summary)updateHotspotSummary(place,result.summary);else refreshSummary();
   clearCommunityIntent();setNotice(result.liked?'Je vindt deze plek leuk.':'Je like is ingetrokken.');
  }catch(e){if(currentOwner.current===actor)setError((e as Error).message);}
  finally{likeLock.current=false;setBusy(false);}
 };
 const review=()=>{setNotice('');setFeedbackHero(false);if(!owner){setGate('review');return;}if(!own||loading)return;setFormOpen(true);};
 useEffect(()=>{
  if(!owner||!own||loadedOwner!==owner||loading)return;
  const intent=readCommunityIntent();
  if(!intent||hotspotKey(intent)!==key||handledIntent.current===`${owner}/${key}/${intent.at}`)return;
  handledIntent.current=`${owner}/${key}/${intent.at}`;
  if(intent.action==='review'){clearCommunityIntent();setFormOpen(true);}
  else if(own.liked){clearCommunityIntent();}else void like(true);
 },[owner,own,loading,key]);
 const returnPath=`${location.pathname}${location.search}#reviews`;
 const authPath=(mode:string)=>`/account?mode=${mode}&intent=${gate}&next=${encodeURIComponent(returnPath)}`;
 return <CommunityContext.Provider value={{place,name,own:loadedOwner===owner?own:null,loading,error,busy,refresh,review,like:()=>like(),formOpen,closeForm:()=>setFormOpen(false),setOwn:setOwned,notice,notify:text=>{setNotice(text);setFeedbackHero(false);},feedbackHero}}>
  {children}
  {gate&&<MemberDialog title={gate==='like'?'Vind je deze plek leuk?':'Deel jouw ervaring met je hond'} onClose={()=>setGate(null)}>
   <div className="hotspot-account-gate"><p>{gate==='like'?`Geef ${name} een like met je gratis account.`:`Help andere baasjes met jouw ervaring bij ${name}. Log in of maak een gratis account.`}</p>
    <div className="hotspot-gate-actions"><Link className="member-button member-button-primary" to={authPath('register')} onClick={()=>rememberCommunityIntent(place,gate)}>Maak een gratis account<ArrowRight size={17}/></Link><Link className="member-button" to={authPath('login')} onClick={()=>rememberCommunityIntent(place,gate)}>Ik heb al een account</Link></div>
    <p className="hotspot-muted">Daarna kom je hier terug om verder te gaan.</p>
   </div>
  </MemberDialog>}
 </CommunityContext.Provider>;
}

export function HotspotLikeButton() {
 const c=useCommunity(),member=useMember();
 const disabled=c.busy||c.loading||member.sessionLoading||Boolean(member.session&&(!member.data||member.data.profile.status!=='active'));
 return <button className={`hotspot-like-button ${c.own?.liked?'is-liked':''}`} type="button" aria-pressed={c.own?.liked??false} disabled={disabled} onClick={()=>void c.like()}>{c.busy?<Loader2 size={17} className="animate-spin"/>:<ThumbsUp size={17}/>}<span>Vind ik leuk</span>{c.own?.liked&&<Check size={14}/>}</button>;
}

export function HotspotLikeFeedback() {
 const c=useCommunity();
 if(!c.feedbackHero||(!c.notice&&!c.error))return null;
 return <div className="mt-3 text-sm" aria-live="polite">{c.notice&&<p className="hotspot-success" role="status"><Check size={15}/>{c.notice}</p>}{c.error&&<p className="hotspot-error" role="alert">{c.error}<button type="button" onClick={()=>void c.refresh()}>Opnieuw laden</button></p>}</div>;
}

type PublicData = HotspotSummary & {available:boolean;reviews:HotspotReview[];distribution:Record<string,number>};
export default function HotspotReviews() {
 const c=useCommunity(),member=useMember(),key=hotspotKey(c.place),sequence=useRef(0);
 const [data,setData]=useState<PublicData|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[more,setMore]=useState(false),[withdraw,setWithdraw]=useState(false),[withdrawing,setWithdrawing]=useState(false);
 const {refresh:refreshSummary}=useHotspotSummary(c.place);
 const load=async(append=false)=>{
  const request=++sequence.current;setLoading(true);setError('');const last=append?data?.reviews.at(-1):null;
  try{
   const {data:result,error:failure}=await supabase.rpc('public_hotspot_reviews',{p_city:c.place.city,p_slug:c.place.slug,p_before:last?.created_at??null,p_before_id:last?.id??null});
   if(request!==sequence.current)return;if(failure)throw failure;
   const next=result as PublicData;if(!next.available)throw new Error('Deze plek is niet meer beschikbaar.');
   const rows=next.reviews.slice(0,20);setMore(next.reviews.length>20);
   setData(old=>({...next,reviews:append&&old?[...old.reviews,...rows.filter(r=>!old.reviews.some(x=>x.id===r.id))]:rows}));
  }catch(e){if(request===sequence.current)setError((e as Error).message==='Deze plek is niet meer beschikbaar.'?(e as Error).message:'De reviews konden niet geladen worden. Probeer opnieuw.');}
  finally{if(request===sequence.current)setLoading(false);}
 };
 useEffect(()=>{setData(null);void load();return()=>{sequence.current++;};},[key]);
 const formActive=useRef(c.formOpen);formActive.current=c.formOpen;
 useEffect(()=>{
  const refresh=()=>{if(!document.hidden&&!formActive.current)void load();};
  const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[key]);
 const changed=()=>{void load();refreshSummary();};
 const score=data?reviewScore(data):null;
 const own=c.own?.review;
 const canWrite=!member.session||member.data?.profile.status==='active';
 const remove=async()=>{
  if(!own)return;setWithdrawing(true);setError('');
  try{const next=await hotspotAction({action:'withdraw',...c.place,version:own.version});c.setOwn(next);setWithdraw(false);c.notify('Je review is ingetrokken.');changed();}
  catch(e){setError((e as Error).message);await c.refresh();}finally{setWithdrawing(false);}
 };
 return <section id="reviews" className="hotspot-reviews" aria-labelledby="hotspot-reviews-title">
  <div className="hotspot-reviews-heading"><div><p className="hotspot-eyebrow">Van baasje tot baasje</p><h2 id="hotspot-reviews-title">Met je hond bij {c.name}</h2><p>Ervaringen die je helpen kiezen.</p></div>
   <button type="button" className="hotspot-review-primary" onClick={c.review} disabled={!canWrite||c.loading||Boolean(member.session&&!c.own)}><Pencil size={16}/>{own&&own.status!=='withdrawn'?'Mijn review':'Schrijf een review'}</button>
  </div>
  {!c.feedbackHero&&<div className="hotspot-action-feedback" aria-live="polite">{c.notice&&<p role="status" className="hotspot-success"><Check size={16}/>{c.notice}</p>}{c.error&&<p role="alert" className="hotspot-error">{c.error}<button type="button" onClick={()=>void c.refresh()}>Opnieuw laden</button></p>}</div>}
  {own&&<div className="hotspot-own-review"><span><Check size={16}/>{reviewStatus(own)}</span>{own.status!=='withdrawn'&&<button type="button" onClick={()=>setWithdraw(true)} disabled={withdrawing}><Trash2 size={14}/>Intrekken</button>}</div>}
  {c.formOpen&&c.own&&member.data?.profile.status==='active'&&<HotspotReviewEditor own={own??null} onSaved={changed}/>}
  {error&&<div className="hotspot-error" role="alert"><p>{error}</p><button type="button" onClick={()=>void load()}>Opnieuw proberen</button></div>}
  {loading&&!data?<div className="hotspot-review-loading" role="status"><Loader2 size={19} className="animate-spin"/>Ervaringen laden…</div>:data&&<>
   {score&&<div className="hotspot-review-overview"><div className="hotspot-review-score"><strong>{score}<small>/5</small></strong><StarRating rating={Number(data.average)} readOnly size={19}/><span>{data.count} {data.count===1?'review':'reviews'}</span>{data.count<3&&<small>{data.count===1?'Eerste beoordeling':'Weinig beoordelingen'}</small>}</div>
    <div className="hotspot-review-distribution" aria-label="Verdeling van de sterren">{[5,4,3,2,1].map(n=><div key={n}><span>{n}<Star size={11}/></span><meter min={0} max={Math.max(1,data.count)} value={data.distribution[n]??0} aria-label={`${n} sterren: ${data.distribution[n]??0} reviews`}/><span>{data.distribution[n]??0}</span></div>)}</div>
    <p className="hotspot-muted">Beoordelingen van leden over hun ervaring met hun hond. Bezoeken zijn niet door ons geverifieerd.</p>
   </div>}
   {!data.reviews.length?<div className="hotspot-review-empty"><MessageSquare size={26}/><h3>Nog geen reviews.</h3><p>Ben je hier geweest met je hond? Jouw ervaring helpt het volgende baasje.</p><button type="button" onClick={c.review} disabled={!canWrite||c.loading}>Deel als eerste je ervaring<ArrowRight size={15}/></button></div>:<div className="hotspot-review-list">{data.reviews.map(r=><article key={r.id} className="hotspot-review"><header><span className="hotspot-review-avatar" aria-hidden="true">{r.user_name.charAt(0).toUpperCase()}</span><div><h3>{r.user_name}</h3><p>{new Intl.DateTimeFormat('nl-BE',{dateStyle:'medium',timeZone:'Europe/Brussels'}).format(new Date(r.created_at))}{r.edited?' · Bijgewerkt':''}</p></div><StarRating rating={r.rating} readOnly size={17}/></header>{r.visit_month&&<p className="hotspot-review-visit">Bezocht in {new Intl.DateTimeFormat('nl-BE',{month:'long',year:'numeric',timeZone:'Europe/Brussels'}).format(new Date(`${r.visit_month}T12:00:00Z`))}</p>}<p className="hotspot-review-text">{r.comment}</p><HotspotReviewFlag id={r.id}/></article>)}</div>}
   {more&&<button className="hotspot-review-more" disabled={loading} onClick={()=>void load(true)}>{loading?'Laden…':'Meer reviews bekijken'}</button>}
  </>}
  {withdraw&&<MemberDialog title="Je review intrekken?" onClose={()=>!withdrawing&&setWithdraw(false)}><div className="hotspot-account-gate"><p>Je review verdwijnt uit deze pagina en je sterren tellen niet meer mee. Je kunt later opnieuw een ervaring insturen.</p><div className="hotspot-gate-actions"><button className="member-button member-button-danger" type="button" disabled={withdrawing} onClick={()=>void remove()}>{withdrawing?<Loader2 size={16} className="animate-spin"/>:<Trash2 size={16}/>}Trek mijn review in</button><button className="member-button" type="button" disabled={withdrawing} onClick={()=>setWithdraw(false)}>Behouden</button></div>{error&&<p className="hotspot-error" role="alert">{error}</p>}</div></MemberDialog>}
 </section>;
}

function HotspotReviewEditor({own,onSaved}:{own:OwnReview|null;onSaved:()=>void}) {
 const c=useCommunity(),member=useMember();const actor=member.data!.profile.id,actorRef=useRef(actor);actorRef.current=member.data?.profile.id??'';
 const draftKey=`haz-review-draft/${actor}/${hotspotKey(c.place)}`;
 const [initial]=useState(()=>{
  try{const draft=JSON.parse(sessionStorage.getItem(draftKey)||'null');if(draft&&draft.version===(own?.version??null)&&Date.now()-draft.at<86400000)return draft;}catch{/* no valid draft */}
  return {rating:own?.rating??0,comment:own?.comment??'',name:own?.name||member.data?.profile.display_name?.slice(0,50)||'',visitMonth:own?.visit_month?.slice(0,7)??'',version:own?.version??null};
 });
 const [rating,setRating]=useState<number>(initial.rating),[comment,setComment]=useState<string>(initial.comment),[name,setName]=useState<string>(initial.name),[visitMonth,setVisitMonth]=useState<string>(initial.visitMonth),[experience,setExperience]=useState(false),[website,setWebsite]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[baseVersion,setBaseVersion]=useState<number|null>(initial.version),[conflict,setConflict]=useState<OwnReview|null>(null);
 useEffect(()=>{try{sessionStorage.setItem(draftKey,JSON.stringify({rating,comment,name,visitMonth,version:baseVersion,at:Date.now()}));}catch{/* Form remains usable without browser storage. */}},[rating,comment,name,visitMonth,baseVersion]);
 const dirty=rating!==(own?.rating??0)||comment!==(own?.comment??'')||name!==(own?.name||member.data?.profile.display_name?.slice(0,50)||'')||visitMonth!==(own?.visit_month?.slice(0,7)??'');
 useEffect(()=>{if(!dirty)return;const before=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);},[dirty]);
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();if(!rating||!experience||comment.trim().length<20||!name.trim()){setError('Kies sterren, vul je naam en ervaring in en bevestig je eigen bezoek.');return;}
  setBusy(true);setError('');
  try{
   const next=await hotspotAction({action:'submit',...c.place,rating,comment,name,visitMonth:visitMonth?`${visitMonth}-01`:null,version:baseVersion,ownExperience:true,website});
   if(actorRef.current!==actor)return;
   try{sessionStorage.removeItem(draftKey);}catch{/* The server save already succeeded. */}c.setOwn(next);c.closeForm();c.notify('Bedankt! Je ervaring verschijnt na controle.');onSaved();
  }catch(e){setError((e as Error).message);if((e as Error).message.includes('intussen')){try{const latest=await hotspotAction({action:'state',...c.place});if(actorRef.current===actor){c.setOwn(latest);setConflict(latest.review);}}catch{/* The existing draft remains available. */}}}finally{setBusy(false);}
 };
 return <MemberDialog title={own?'Jouw ervaring aanpassen':'Jouw ervaring met je hond'} onClose={()=>!busy&&c.closeForm()} wide>
  <form className="hotspot-review-editor" onSubmit={submit}><p className="hotspot-muted">Bij {c.name}. Je review verschijnt na controle.</p>
   <div className="review-honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
   <fieldset disabled={busy}><legend>Hoe was je ervaring met je hond?</legend><StarRating rating={rating} onRate={setRating} size={28}/><p className="hotspot-rating-label" aria-live="polite">{rating?['','Niet fijn','Kon beter','Goed','Heel fijn','Fantastisch'][rating]:'Kies 1 tot 5 sterren'}</p></fieldset>
   <label className="member-field">Je ervaring<textarea autoFocus name="review-comment" required minLength={20} maxLength={1000} rows={5} value={comment} disabled={busy||own?.status==='hidden'} onChange={e=>setComment(e.target.value)} placeholder="Was je hond binnen welkom? Hoe werden jullie ontvangen? Wat moeten andere baasjes weten?"/><small>{comment.length}/1000 · minstens 20 tekens</small></label>
   <div className="hotspot-review-fields"><label className="member-field">Naam bij je review<input name="review-name" required maxLength={50} value={name} disabled={busy} onChange={e=>setName(e.target.value)} autoComplete="nickname"/></label><label className="member-field"><span className="hotspot-review-field-label">Wanneer was je er? <small>Optioneel</small></span><input type="month" name="review-visit" min="2000-01" max={new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit'}).format(new Date()).slice(0,7)} value={visitMonth} disabled={busy} onChange={e=>setVisitMonth(e.target.value)}/></label></div>
   <label className="member-checkbox"><input type="checkbox" required checked={experience} disabled={busy} onChange={e=>setExperience(e.target.checked)}/><span>Dit is mijn eigen bezoekervaring. Ik beoordeel niet mijn eigen zaak en plaats deze review zonder vergoeding.</span></label>
   {error&&<p className="hotspot-error" role="alert">{error}</p>}
   {conflict&&<div className="hotspot-own-review" style={{display:'block'}}><details><summary>Bekijk je huidige review</summary><StarRating rating={conflict.rating} readOnly/><p className="hotspot-review-text">{conflict.comment}</p></details><div className="hotspot-editor-footer"><button className="member-button" type="button" onClick={()=>{setRating(conflict.rating);setComment(conflict.comment);setName(conflict.name);setVisitMonth(conflict.visit_month?.slice(0,7)??'');setBaseVersion(conflict.version);setConflict(null);setError('');}}>Huidige review gebruiken</button><button className="member-button" type="button" onClick={()=>{setBaseVersion(conflict.version);setConflict(null);setError('');}}>Verder met mijn tekst</button></div></div>}
   {own?.status==='hidden'&&<p className="hotspot-error">Deze review is verborgen. Neem contact op via info@hondaanzee.be.</p>}
   <div className="hotspot-editor-footer"><button className="member-button member-button-primary" disabled={busy||Boolean(conflict)||own?.status==='hidden'}>{busy?<Loader2 size={17} className="animate-spin"/>:<Check size={17}/>}Ter controle insturen</button><button className="member-button" type="button" disabled={busy} onClick={c.closeForm}>Later verder</button></div>
  </form>
 </MemberDialog>;
}

function HotspotReviewFlag({id}:{id:string}) {
 const [open,setOpen]=useState(false),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{const result=await hotspotAction<{message:string}>({action:'flag',id,reason});setMessage(result.message);setOpen(false);}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 return <div className="hotspot-review-flag">{message?<p role="status">{message}</p>:<button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Flag size={13}/>Melden</button>}{open&&<form onSubmit={submit}><label>Waarom meld je deze review?<select required value={reason} disabled={busy} onChange={e=>setReason(e.target.value)}><option value="">Kies een reden</option>{[['spam','Spam'],['privacy','Persoonsgegevens'],['abuse','Belediging of bedreiging'],['off_topic','Niet over deze plek'],['other','Andere reden']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button type="submit" disabled={busy}>{busy?'Versturen…':'Melding versturen'}</button><button type="button" disabled={busy} onClick={()=>setOpen(false)}>Annuleren</button></form>}{error&&<p role="alert" className="hotspot-error">{error}</p>}</div>;
}
