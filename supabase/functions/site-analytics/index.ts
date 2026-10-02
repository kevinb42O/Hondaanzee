import { analyticsInput } from '../_shared/siteAnalytics.ts';
import { ANALYTICS_ROUTES } from '../_shared/analyticsRoutes.ts';
import { getSupabaseAdmin, getClientIp } from '../_shared/http.ts';
import { sha256 } from '../_shared/security.ts';
const origins = new Set(['https://hondaanzee.be','https://www.hondaanzee.be']);
Deno.serve(async req => {
 const origin = req.headers.get('origin') || '';
 if (!origins.has(origin)) return new Response(null,{status:403});
 const headers = {'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
 if(req.method==='OPTIONS') return new Response(null,{status:204,headers});
 if(req.method!=='POST') return new Response(null,{status:405,headers});
 if (/bot|crawler|spider|headless|puppeteer|playwright|curl|wget/i.test(req.headers.get('user-agent') || '')) return new Response(null,{status:204,headers});
 try {
  if (Number(req.headers.get('content-length') || 0)>1024) return new Response(null,{status:413,headers});
  const raw=await req.text(); if(raw.length>1024) return new Response(null,{status:413,headers});
  const parsed=analyticsInput.safeParse(JSON.parse(raw));
  if(!parsed.success) return new Response(null,{status:400,headers});
  const input=parsed.data, db=getSupabaseAdmin();
  const match=input.path.match(/^\/([a-z0-9-]+)\/(hotspots|diensten)\/([a-z0-9-]+)$/);
  if(match){
   const {data,error}=await db.from('content_places').select('id').eq('city_slug',match[1]).eq('kind',match[2]==='hotspots'?'hotspot':'service').eq('slug',match[3]).not('published_revision_id','is',null).is('archived_at',null).maybeSingle();
   if(error || !data) return new Response(null,{status:400,headers});
  } else if(!ANALYTICS_ROUTES.has(input.path) || input.event!=='pageview') return new Response(null,{status:400,headers});
  const salt=Deno.env.get('ANALYTICS_IP_SALT'); if(!salt) throw new Error('Missing configuration');
  const fingerprint=await sha256(`${salt}:${new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}:${getClientIp(req)}`);
  const {data,error}=await db.rpc('record_site_analytics',{p_path:input.path,p_event:input.event,p_referrer:input.referrer,p_device:input.device,p_fingerprint:fingerprint});
  if(error) throw error;
  return new Response(null,{status:data?204:429,headers});
 } catch { return new Response(null,{status:503,headers}); }
});
