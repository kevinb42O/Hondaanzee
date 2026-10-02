import { communityInput } from '../_shared/communityInput.ts';
import { getSupabaseAdmin, getClientIp } from '../_shared/http.ts';
import { sha256 } from '../_shared/security.ts';

const origins = new Set(['https://hondaanzee.be','https://www.hondaanzee.be','http://localhost:3000','http://127.0.0.1:3000']);
Deno.serve(async req => {
 const origin = req.headers.get('origin') || '';
 if (!origins.has(origin)) return new Response(null, { status:403 });
 const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':origin, Vary:'Origin', 'Cache-Control':'no-store', 'Access-Control-Allow-Headers':'content-type,apikey,authorization,x-client-info,x-supabase-api-version,x-user-access-token', 'Access-Control-Allow-Methods':'POST,OPTIONS' };
 const send = (body:unknown, status=200) => new Response(JSON.stringify(body), { status, headers });
 if (req.method==='OPTIONS') return new Response(null,{status:204,headers});
 if (req.method!=='POST') return send({error:'Method not allowed'},405);
 try {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length>8192) return send({error:'Je inzending is te groot.'},413);
  let parsed;
  try { parsed=communityInput.safeParse(JSON.parse(raw)); } catch { return send({error:'Controleer je inzending.'},400); }
  if (!parsed.success) return send({error:'Controleer je sterren, naam en ervaring (20–1000 tekens).'},400);
  const input=parsed.data, db=getSupabaseAdmin();
  const salt=Deno.env.get('ANALYTICS_IP_SALT');
  if (!salt) throw new Error('Missing configuration');
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const fingerprint=await sha256(`community:${salt}:${day}:${getClientIp(req)}`);
  if (input.action==='flag') {
   const {error}=await db.rpc('flag_hotspot_review',{p_id:input.id,p_reason:input.reason,p_fingerprint:fingerprint});
   if(error)throw error;return send({message:'Bedankt. We kijken je melding na.'});
  }
  const token=req.headers.get('x-user-access-token')?.trim();
  if (!token) return send({error:'Log in om een like of review achter te laten.'},401);
  const {data:{user},error:authError}=await db.auth.getUser(token);
  if (authError||!user) return send({error:'Je sessie is verlopen. Log opnieuw in.'},401);
  if(input.action==='export'){
   const {data,error}=await db.rpc('member_hotspot_export',{p_member:user.id});if(error)throw error;return send(data);
  }
  const base={p_member:user.id,p_city:input.city,p_slug:input.slug};
  let result;
  if(input.action==='state')result=await db.rpc('member_hotspot_state',base);
  else if(input.action==='like') {
   const {error}=await db.rpc('community_limit',{p_bucket:'like-ip',p_key:fingerprint,p_max:1000});if(error)throw error;
   result=await db.rpc('set_hotspot_like',{...base,p_liked:input.liked});
  } else if(input.action==='withdraw')result=await db.rpc('withdraw_hotspot_review',{...base,p_version:input.version});
  else {
   if(input.website)return send({error:'Je review kon niet worden ontvangen.'},400);
   result=await db.rpc('submit_hotspot_review',{...base,p_rating:input.rating,p_comment:input.comment,p_name:input.name,p_visit_month:input.visitMonth,p_version:input.version,p_fingerprint:fingerprint});
  }
  if(result.error)throw result.error;
  return send(result.data);
 } catch(error) {
  const code=typeof error==='object'&&error&&'message'in error?String(error.message):'';
  if(code.includes('ACTIVE_MEMBER_REQUIRED'))return send({error:'Je account kan momenteel geen likes of reviews plaatsen.'},403);
  if(code.includes('VERSION_CONFLICT'))return send({error:'Je review is intussen gewijzigd. Vernieuw ze en probeer opnieuw.'},409);
  if(code.includes('RATE_LIMIT'))return send({error:'Je hebt vandaag veel bijdragen geplaatst. Probeer morgen opnieuw.'},429);
  if(code.includes('PLACE_UNAVAILABLE')||code.includes('REVIEW_NOT_FOUND'))return send({error:'Deze plek of review is niet meer beschikbaar.'},404);
  if(code.includes('REVIEW_HIDDEN'))return send({error:'Deze review is verborgen. Neem contact op als je hierover een vraag hebt.'},403);
  if(code.includes('INVALID_REVIEW'))return send({error:'Controleer je sterren, tekst en bezoekmaand.'},400);
  return send({error:'Bewaren lukt even niet. Je invoer blijft staan; probeer opnieuw.'},500);
 }
});
