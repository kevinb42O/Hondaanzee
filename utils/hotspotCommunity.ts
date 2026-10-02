import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient.ts';

export type HotspotRef = { city: string; slug: string };
export type HotspotSummary = { place_id: string; likes: number; count: number; average: number | null };
export type HotspotReview = { id: string; rating: number; user_name: string; comment: string; visit_month: string | null; created_at: string; updated_at: string; edited: boolean };
export type OwnReview = { id: string; version: number; status: string; needs_review: boolean; has_published: boolean; rejected_edit?: boolean; rating: number; comment: string; name: string; visit_month: string | null };
export type HotspotMemberState = { liked: boolean; review: OwnReview | null; summary?: HotspotSummary };
export const hotspotKey = (place: HotspotRef) => `${place.city}/${place.slug}`;
export const reviewScore = (summary: Pick<HotspotSummary, 'average' | 'count'>) => summary.count && summary.average !== null ? Number(summary.average).toLocaleString('nl-BE', { minimumFractionDigits:1, maximumFractionDigits:1 }) : null;

type Entry = { value: HotspotSummary | null; error: string; at: number };
const cache = new Map<string, Entry>();
const subscribers = new Map<string, Set<() => void>>();
const requested = new Map<string, HotspotRef>();
let scheduled = false, generation = 0;
const announce = (key: string) => subscribers.get(key)?.forEach(fn => fn());
function enqueue(place: HotspotRef, force = false) {
 const key = hotspotKey(place), entry=cache.get(key);
 if (!force && entry && Date.now()-entry.at<30000) return;
 requested.set(key,place);
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(async()=>{
  scheduled=false;
  const places=[...requested.values()]; requested.clear();
  const currentGeneration=generation;
  for(let start=0;start<places.length;start+=200){
   const batch=places.slice(start,start+200);
   try{
    const {data,error}=await supabase.rpc('public_hotspot_summaries',{p_places:batch});
    if(error)throw error;
    if(currentGeneration!==generation){batch.forEach(p=>enqueue(p,true));continue;}
    for(const p of batch){const key=hotspotKey(p);cache.set(key,{value:data?.[key]??null,error:'',at:Date.now()});announce(key);}
   }catch{
    if(currentGeneration!==generation)continue;
    for(const p of batch){const key=hotspotKey(p);cache.set(key,{value:cache.get(key)?.value??null,error:'Beoordelingen tijdelijk niet beschikbaar.',at:Date.now()});announce(key);}
   }
  }
 });
}
export function updateHotspotSummary(place: HotspotRef, value: HotspotSummary) {
 generation++;const key=hotspotKey(place);cache.set(key,{value,error:'',at:Date.now()});announce(key);
}
export function useHotspotSummary(place: HotspotRef, enabled = true) {
 const key=hotspotKey(place);
 const [entry,setEntry]=useState<Entry>(()=>cache.get(key)??{value:null,error:'',at:0});
 useEffect(()=>{
  if(!enabled)return;
  const update=()=>setEntry(cache.get(key)??{value:null,error:'',at:0});
  const set=subscribers.get(key)??new Set();set.add(update);subscribers.set(key,set);update();enqueue(place);
  const refresh=()=>{if(!document.hidden)enqueue(place);};
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  const timer=setInterval(refresh,30000);
  return()=>{set.delete(update);if(!set.size)subscribers.delete(key);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);clearInterval(timer);};
 },[key,enabled]);
 return {summary:entry.value,error:entry.error,loading:!entry.at,refresh:()=>enqueue(place,true)};
}

export async function hotspotAction<T = HotspotMemberState>(body: Record<string, unknown>): Promise<T> {
 const {data:{session}}=await supabase.auth.getSession();
 const {data,error}=await supabase.functions.invoke('site-community',{body,headers:session?{'x-user-access-token':session.access_token}:{}});
 if(error){const detail=error.context instanceof Response?await error.context.json().catch(()=>null):null;throw new Error(detail?.error||'Bewaren lukt even niet. Probeer opnieuw.');}
 return data as T;
}

type Intent = HotspotRef & { action:'like'|'review'; at:number };
const intentKey='haz-community-intent';
export function rememberCommunityIntent(place:HotspotRef,action:Intent['action']) {
 try{sessionStorage.setItem(intentKey,JSON.stringify({...place,action,at:Date.now()}));}catch{/* URL still returns to the reviews section. */}
}
export function readCommunityIntent():Intent|null {
 try{const raw=sessionStorage.getItem(intentKey);if(!raw)return null;const v=JSON.parse(raw);if(!v||!['like','review'].includes(v.action)||typeof v.at!=='number'||Date.now()-v.at>1800000||v.at>Date.now()||typeof v.city!=='string'||typeof v.slug!=='string'||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.city)||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug)){sessionStorage.removeItem(intentKey);return null;}return v;}catch{return null;}
}
export function clearCommunityIntent(){try{sessionStorage.removeItem(intentKey);}catch{/* no persistent intent */}}
export const reviewStatus = (review:OwnReview) => review.status==='withdrawn'?'Je review is ingetrokken.':review.status==='hidden'?'Je review is verborgen.':review.needs_review?(review.has_published?'Je wijziging wacht op controle. Je vorige review blijft zichtbaar.':'Je review wacht op controle.'):review.rejected_edit?'Je wijziging is niet gepubliceerd. Je vorige review blijft zichtbaar. Je kunt je ervaring aanpassen.':review.status==='rejected'?'Je review is niet gepubliceerd. Je kunt een aangepaste ervaring insturen.':'Je review is gepubliceerd.';

export function clearHotspotDrafts(memberId:string){try{const prefix=`haz-review-draft/${memberId}/`;for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith(prefix))sessionStorage.removeItem(key);}}catch{/* Local storage may be unavailable. */}}
