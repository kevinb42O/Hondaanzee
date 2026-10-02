import {zoneRequest,mergeZone}from '../_shared/zoneDraft.ts';
import {getSupabaseAdmin,handleOptions,json}from '../_shared/http.ts';
import {requireAdminUser}from '../_shared/security.ts';
const fields='id,kind,legacy_id,slug,city_slug,version,draft_revision_id,published_revision_id,archived_at,updated_at,draft:content_place_revisions!content_places_draft_revision_fk(content),published:content_place_revisions!content_places_published_revision_fk(content)';
Deno.serve(async req=>{
 const options=handleOptions(req);if(options)return options;if(req.method!=='POST')return json({error:'Method not allowed'},405);
 let actor;try{actor=await requireAdminUser(req);}catch{return json({error:'Log in met je beheeraccount.'},403);}
 try{
 const raw=await req.text();if(new TextEncoder().encode(raw).length>65536)return json({error:'Te groot verzoek.'},413);
 const parsed=zoneRequest.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:parsed.error.issues[0]?.message||'Controleer je gegevens.'},400);
 const input=parsed.data,db=getSupabaseAdmin();
 if(input.action==='list'){const {data,error}=await db.from('content_places').select(fields).eq('kind','offleash').order('legacy_id').limit(1000);if(error)throw error;return json({zones:data});}
 if(input.action==='create'){const content=mergeZone({access:'unknown',operationalStatus:'unknown',visibility:'visible'},input.patch);const{data,error}=await db.rpc('create_content_place_draft',{p_kind:'offleash',p_city:input.city,p_slug:input.slug,p_content:content,p_actor_id:actor.id});if(error)throw error;return json(data,201);}
 const{data:zone,error}=await db.from('content_places').select(fields).eq('kind','offleash').eq('id',input.id).maybeSingle();if(error)throw error;if(!zone)return json({error:'Zone niet gevonden.'},404);
 if(input.action==='detail'){const{data:history,error:historyError}=await db.from('content_place_revisions').select('id,revision_number,content,created_at').eq('place_id',zone.id).order('revision_number',{ascending:false}).limit(100);if(historyError)throw historyError;return json({zone,history});}
 const original=(zone.draft as any).content,content=mergeZone(original,input.patch);
 if(input.media){const originalUrls=new Set([original.image,...(original.images||[])].filter(Boolean));const added=[...new Set([input.media.image,...input.media.images].filter(u=>u&&!originalUrls.has(u)))];if(input.media.image&&input.media.image!==original.image&&!input.media.images.includes(input.media.image))return json({error:'De hoofdfoto moet in je galerij staan.'},400);if(added.length){const{data,error}=await db.from('media_assets').select('public_url').eq('storage_provider','r2').eq('status','verified').in('public_url',added);if(error)throw error;if(data.length!==added.length||added.some(u=>!u.startsWith('https://media.hondaanzee.be/zaken/')))return json({error:'Nieuwe foto’s moeten via de gecontroleerde R2-upload worden toegevoegd.'},400);}Object.assign(content,input.media);}
 const{data,error:saveError}=await db.rpc('save_content_place_draft',{p_place_id:zone.id,p_expected_version:input.version,p_content:content,p_actor_id:actor.id});if(saveError)throw saveError;return json(data);
 }catch(e){const m=typeof e==='object'&&e&&'message'in e?String(e.message):'';if(m.includes('VERSION_CONFLICT'))return json({error:'De zone is intussen gewijzigd. Laad de laatste versie voordat je opnieuw opslaat.'},409);if(m.includes('offleash_slug_unique')||m.includes('duplicate key'))return json({error:'Deze zone-slug bestaat al. Kies een andere.'},409);if(m.startsWith('Vul bevestigde')||m.startsWith('Geef een toelichting'))return json({error:m},400);return json({error:'De zone kon niet worden opgeslagen.'},500);}
});
