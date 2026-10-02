import {getSupabaseAdmin,handleOptions,json} from '../_shared/http.ts';
import {requireAdminUser} from '../_shared/security.ts';
Deno.serve(async req=>{
 const options=handleOptions(req); if(options)return options;
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{await requireAdminUser(req);}catch{return json({error:'Log in met je beheeraccount.'},403);}
 try{
  const {days}=await req.json(); if(![7,30,90,365].includes(days))return json({error:'Kies een geldige periode.'},400);
  const db=getSupabaseAdmin();
  const {data:archive,error:archiveError}=await db.from('analytics_imports').select('payload').eq('source','vercel').order('imported_at',{ascending:false}).limit(1).maybeSingle();if(archiveError)throw archiveError;
  const cleanup=await db.rpc('cleanup_site_analytics');if(cleanup.error)throw cleanup.error;
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const start=new Date(`${today}T12:00:00Z`);start.setUTCDate(start.getUTCDate()-days+1);
  const rows=[];
  // Page through real rows: Supabase's default 1000-row cap must not truncate totals.
  for(let offset=0;offset<50000;offset+=1000){
   const {data,error}=await db.from('analytics_daily').select('*').gte('day',start.toISOString().slice(0,10)).lte('day',today).order('day').order('path').order('event').order('referrer').order('device').range(offset,offset+999);
   if(error)throw error; rows.push(...data);if(data.length<1000)return json({rows,today,startedAt:'2026-10-02',timezone:'Europe/Brussels',history:archive?.payload||null});
  }
  return json({error:'Deze periode bevat te veel details. Kies een kortere periode.'},413);
 }catch{return json({error:'De statistieken konden niet geladen worden.'},500);}
});
