import { z } from 'zod';
import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';
const cursor=z.object({date:z.iso.datetime({offset:true}),id:z.uuid()}).strict();
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('overview')}).strict(),
 z.object({action:z.literal('places')}).strict(),
 z.object({action:z.literal('list'),filter:z.enum(['all','attention','pending','published','hidden','rejected','withdrawn','flagged']).default('attention'),kind:z.enum(['all','hotspot','offleash']).default('all'),city:z.string().max(80).default(''),zone:z.uuid().nullable().optional(),rating:z.number().int().min(1).max(5).nullable().optional(),search:z.string().max(200).default(''),cursor:cursor.nullable().optional()}).strict(),
 z.object({action:z.literal('detail'),id:z.uuid()}).strict(),
 z.object({action:z.literal('moderate'),id:z.uuid(),version:z.number().int().positive(),decision:z.enum(['publish','hide','reject','restore','redact','note','resolve']),reason:z.string().trim().max(500).default(''),note:z.string().trim().max(2000).default(''),publicName:z.string().trim().max(50).optional(),publicComment:z.string().trim().max(1000).optional()}).strict(),
]);
Deno.serve(async req=>{
 const options=handleOptions(req);if(options)return options;if(req.method!=='POST')return json({error:'Method not allowed'},405);
 let actor;try{actor=await requireAdminUser(req);}catch{return json({error:'Log in met je beheeraccount.'},403);}
 try {
  const raw=await req.text();if(new TextEncoder().encode(raw).length>16384)return json({error:'Te groot verzoek.'},413);
  const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:'Controleer je verzoek.'},400);
  const input=parsed.data,db=getSupabaseAdmin();
  if(input.action==='overview') {
   const [legacy,hotspots]=await Promise.all([db.rpc('admin_review_overview'),db.rpc('admin_hotspot_review_overview')]);
   if(legacy.error)throw legacy.error;if(hotspots.error)throw hotspots.error;
   const keys=new Set([...Object.keys(legacy.data.counts),...Object.keys(hotspots.data.counts)]);
   return json({counts:Object.fromEntries([...keys].map(key=>[key,(legacy.data.counts[key]||0)+(hotspots.data.counts[key]||0)])),zones:legacy.data.zones,places:hotspots.data.places});
  }
  if(input.action==='places') {
   const {data,error}=await db.from('content_places').select('id,kind,city_slug,slug,draft:content_place_revisions!content_places_draft_revision_fk(content)').in('kind',['hotspot','offleash']);
   if(error)throw error;return json({places:(data||[]).map(p=>({id:p.id,kind:p.kind,city_slug:p.city_slug,slug:p.slug,name:(p.draft as any)?.content?.name||p.slug}))});
  }
  if(input.action==='list') {
   const {data,error}=await db.rpc('admin_community_review_list',{p_filter:input.filter,p_kind:input.kind,p_city:input.city,p_place:input.zone||null,p_rating:input.rating||null,p_search:input.search,p_before:input.cursor?.date||null,p_before_id:input.cursor?.id||null});
   if(error)throw error;return json({reviews:data});
  }
  const {data:hotspot,error:hotspotError}=await db.from('hotspot_reviews').select('*').eq('id',input.id).maybeSingle();if(hotspotError)throw hotspotError;
  if(input.action==='detail') {
   const modern=!!hotspot;
   const result=modern?{data:hotspot,error:null}:await db.from('reviews').select('*').eq('id',input.id).maybeSingle();
   if(result.error)throw result.error;if(!result.data)return json({error:'Review niet gevonden.'},404);
   const review=result.data;
   const [history,revisions,flags,place]=await Promise.all([
    db.from(modern?'hotspot_review_actions':'review_actions').select('id,actor_id,action,from_status,to_status,reason,note,created_at').eq('review_id',input.id).order('created_at',{ascending:false}).limit(100),
    db.from(modern?'hotspot_review_versions':'review_revisions').select('*').eq('review_id',input.id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(100),
    db.from(modern?'hotspot_review_flags':'review_flags').select('id,reason,created_at,resolved_at').eq('review_id',input.id).order('created_at',{ascending:false}).limit(100),
    db.from('content_places').select('id,city_slug,slug,draft:content_place_revisions!content_places_draft_revision_fk(content)').eq('id',modern?review.place_id:review.zone_id).single(),
   ]);
   for(const r of[history,revisions,flags,place])if(r.error)throw r.error;
   const {member_id,user_id,...safe}=review;
   let latest:any=null,approved:any=null,original:any=null;
   if(modern){
    const [basis,first]=await Promise.all([
     db.from('hotspot_review_versions').select('*').in('id',[review.submitted_revision_id,review.published_revision_id].filter(Boolean)),
     db.from('hotspot_review_versions').select('*').eq('review_id',review.id).eq('source','author').order('created_at').order('id').limit(1),
    ]);
    if(basis.error)throw basis.error;if(first.error)throw first.error;
    latest=basis.data!.find(v=>v.id===review.submitted_revision_id);approved=basis.data!.find(v=>v.id===review.published_revision_id);original=first.data![0];
   }
   return json({review:{...safe,...(modern?{zone_id:review.place_id,area_slug:place.data!.slug,rating:latest!.rating,public_name:latest!.public_name,public_comment:latest!.comment,user_name:original?.public_name,comment:original?.comment,original_rating:original?.rating}:{}),kind:modern?'hotspot':'offleash',with_account:!!(member_id||user_id),zone_name:(place.data!.draft as any).content.name,city_slug:place.data!.city_slug},
    approved:approved?{rating:approved.rating,public_name:approved.public_name,comment:approved.comment}:null,
    history:(history.data||[]).map(({actor_id,...entry})=>({...entry,actor_label:actor_id===actor.id?actor.email:'Beheerder'})),
    revisions:(revisions.data||[]).map(v=>({...v,public_comment:modern?v.comment:v.public_comment})),flags:flags.data});
  }
  if(input.decision==='redact'&&(!input.publicName?.trim()||input.publicComment===undefined))return json({error:'Vul een publieke naam en reviewtekst in.'},400);
  if(!hotspot&&input.publicComment&&input.publicComment.length>500)return json({error:'Zonereviews hebben maximaal 500 tekens.'},400);
  const {data,error}=await db.rpc(hotspot?'moderate_hotspot_review':'moderate_zone_review',{p_id:input.id,p_version:input.version,p_action:input.decision,p_reason:input.reason,p_note:input.note,p_public_name:input.publicName||null,p_public_comment:input.publicComment??null,p_actor:actor.id});
  if(error)throw error;return json(data);
 } catch(e) {
  const m=typeof e==='object'&&e&&'message'in e?String(e.message):'';
  if(m.includes('VERSION_CONFLICT'))return json({error:'Deze review is intussen gewijzigd. Vernieuw het detail voordat je verdergaat.'},409);
  if(m.includes('REASON_REQUIRED'))return json({error:'Geef een reden voor deze beslissing.'},400);
  if(m.includes('REVIEW_WITHDRAWN'))return json({error:'De auteur heeft deze review ingetrokken. Je kunt ze niet publiceren.'},409);
  if(m.includes('ACTIVE_MEMBER_REQUIRED'))return json({error:'Deze auteur heeft geen actief account.'},403);
  if(m.includes('REVIEW_NOT_PUBLISHED'))return json({error:'Publieke redactie is alleen mogelijk voor een gepubliceerde review.'},400);
  if(m.includes('REVIEW_NOT_FOUND'))return json({error:'Review niet gevonden.'},404);
  if(m.includes('INVALID_REVIEW'))return json({error:'Controleer de publieke naam en tekst (20–1000 tekens).'},400);
  return json({error:'De reviewgegevens konden niet worden verwerkt.'},500);
 }
});
