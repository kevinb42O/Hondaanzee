import {getSupabaseAdmin} from '../_shared/http.ts';
import {sha256} from '../_shared/security.ts';
Deno.serve(async req=>{
 if(req.method!=='GET')return new Response(null,{status:405});
 const expected=Deno.env.get('CATALOG_BUILD_TOKEN'),provided=req.headers.get('x-catalog-build-token')||'';
 if(!expected||await sha256(expected)!==await sha256(provided))return new Response(null,{status:403});
 const releaseId=new URL(req.url).searchParams.get('release');
 if(releaseId&&!/^[a-f0-9-]{36}$/.test(releaseId))return new Response(null,{status:400});
 const {data,error}=await getSupabaseAdmin().rpc('read_catalog_build',{p_release_id:releaseId});
 if(error)return new Response(null,{status:503});
 return Response.json(data,{headers:{'Cache-Control':'no-store'}});
});
