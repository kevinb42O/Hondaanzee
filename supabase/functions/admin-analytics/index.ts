import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';
Deno.serve(async req => {
 const options=handleOptions(req);if(options)return options;
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{await requireAdminUser(req);}catch{return json({error:'Log in met je beheeraccount.'},403);}
 try{
  const {days,hours}=await req.json();const hourly=hours===24&&days===undefined;
  if(!hourly&&(![7,30,90,365].includes(days)||hours!==undefined))return json({error:'Kies een geldige periode.'},400);
  const db=getSupabaseAdmin();
  const {data:archive,error:archiveError}=await db.from('analytics_imports').select('payload').eq('source','vercel').order('imported_at',{ascending:false}).limit(1).maybeSingle();if(archiveError)throw archiveError;
  const cleanup=await db.rpc('cleanup_site_analytics');if(cleanup.error)throw cleanup.error;
  const now=new Date(),formatDay=(date:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).format(date),today=formatDay(now);
  const start=new Date(`${today}T12:00:00Z`);start.setUTCDate(start.getUTCDate()-(days||1)+1);
  const endHour=new Date(Math.floor(now.getTime()/3600000)*3600000),startHour=new Date(endHour.getTime()-23*3600000);
  const {data:coverage,error:coverageError}=hourly?await db.from('analytics_hourly_coverage').select('started_at').eq('id',true).single():{data:null,error:null};if(coverageError)throw coverageError;
  const rows=[];
  // Pagination prevents Supabase's default 1000-row cap from truncating totals.
  for(let offset=0;offset<50000;offset+=1000){
   const field=hourly?'hour':'day';const {data,error}=await db.from(hourly?'analytics_hourly':'analytics_daily').select('*').gte(field,hourly?startHour.toISOString():start.toISOString().slice(0,10)).lte(field,hourly?endHour.toISOString():today).order(field).order('path').order('event').order('referrer').order('device').range(offset,offset+999);
   if(error)throw error;rows.push(...data);if(data.length<1000)return json({rows:hourly?rows.map(row=>({...row,day:formatDay(new Date(row.hour))})):rows,today,startedAt:'2026-10-02',timezone:'Europe/Brussels',history:archive?.payload||null,...(hourly?{window:{start:startHour.toISOString(),end:endHour.toISOString(),now:now.toISOString(),startedAt:coverage!.started_at}}:{})});
  }
  return json({error:'Deze periode bevat te veel details. Kies een kortere periode.'},413);
 }catch{return json({error:'De statistieken konden niet geladen worden.'},500);}
});
