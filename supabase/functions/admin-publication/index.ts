import {getSupabaseAdmin,handleOptions,json} from '../_shared/http.ts';
import {requireAdminUser,sha256} from '../_shared/security.ts';
const projectId='prj_V1lWf8onpSjTtsrFWMD4wENmRm36';
const teamId='team_uvox0ExXP24CXQEbI2G8qZEE';
async function vercel(path:string,body?:unknown){
 const token=Deno.env.get('VERCEL_PUBLICATION_TOKEN');if(!token)throw new Error('PUBLICATION_NOT_CONFIGURED');
 const response=await fetch(`https://api.vercel.com${path}${path.includes('?')?'&':'?'}teamId=${teamId}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});
 const data=await response.json();if(!response.ok)throw new Error(`VERCEL_${response.status}`);return data;
}
async function synchronize(){
 const db=getSupabaseAdmin();
 const {data:job,error}=await db.from('publication_jobs').select('*').in('status',['requested','building']).maybeSingle();if(error)throw error;if(!job)return;
 let deploymentId=job.deployment_id;
 if(!deploymentId){
  const list=await vercel(`/v6/deployments?projectId=${projectId}&limit=20`);
  const candidate=list.deployments.find((d:any)=>d.meta?.haz_job_id===job.id&&d.meta?.haz_release_id===job.release_id);
  if(!candidate)return;
  deploymentId=candidate.uid;
  const {error:updateError}=await db.from('publication_jobs').update({status:'building',deployment_id:deploymentId,deployment_url:`https://${candidate.url}`,updated_at:new Date().toISOString(),error_message:null}).eq('id',job.id).in('status',['requested','building']);if(updateError)throw updateError;
 }
 const deployment=await vercel(`/v13/deployments/${deploymentId}`);
 if(deployment.projectId!==projectId||deployment.target!=='production'||deployment.meta?.haz_release_id!==job.release_id)throw new Error('DEPLOYMENT_MISMATCH');
 if(['ERROR','CANCELED'].includes(deployment.readyState)){
  const {error:updateError}=await db.from('publication_jobs').update({status:'failed',error_message:'De Vercel-build is mislukt of geannuleerd. De vorige websiteversie blijft bereikbaar.',updated_at:new Date().toISOString()}).eq('id',job.id).in('status',['requested','building']);if(updateError)throw updateError;return;
 }
 if(deployment.readyState!=='READY')return;
 // Verify both the exact immutable release and real production assignment.
 const project=await vercel(`/v9/projects/${projectId}`);
 if(project.targets?.production?.id!==deploymentId)return;
 const response=await fetch(`https://www.hondaanzee.be/catalog-release.json?check=${job.id}`,{cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)return;const marker=await response.json();
 const {data:release,error:releaseError}=await db.from('content_releases').select('snapshot_sha256').eq('id',job.release_id).single();if(releaseError)throw releaseError;
 if(marker.releaseId!==job.release_id||marker.sha256!==release.snapshot_sha256)return;
 const {error:completeError}=await db.rpc('complete_content_publication',{p_job_id:job.id,p_deployment_id:deploymentId});if(completeError)throw completeError;
}
Deno.serve(async req=>{
 const options=handleOptions(req);if(options)return options;if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const workerExpected=Deno.env.get('PUBLICATION_WORKER_TOKEN'),workerProvided=req.headers.get('x-publication-worker-token');
 const worker=!!workerExpected&&!!workerProvided&&await sha256(workerExpected)===await sha256(workerProvided);
 let actor; if(!worker){try{actor=await requireAdminUser(req);}catch{return json({error:'Log in met je beheeraccount.'},403);}}
 try{
  const raw=await req.text();if(raw.length>16384)return json({error:'Te groot verzoek.'},413);
  const input=JSON.parse(raw),db=getSupabaseAdmin();
  if(worker && input.action!=='sync')return json({error:'Method not allowed'},403);
  if(input.action==='sync'){await synchronize();return json({ok:true});}
  if(input.action==='status'){
   const configured=!!Deno.env.get('VERCEL_PUBLICATION_TOKEN')&&!!Deno.env.get('CATALOG_BUILD_TOKEN');
   if(configured)await synchronize();
   const {data:jobs,error}=await db.from('publication_jobs').select('*').order('created_at',{ascending:false}).limit(15);if(error)throw error;
   return json({configured,jobs});
  }
  if(input.action!=='publish')return json({error:'Ongeldig verzoek.'},400);
  if(!Deno.env.get('VERCEL_PUBLICATION_TOKEN'))return json({error:'De beperkte Vercel-publicatiesleutel is nog niet ingesteld.'},503);
  if(!input.places||typeof input.places!=='object'||Array.isArray(input.places)||Object.keys(input.places).length>200)return json({error:'Selecteer de zaken die je wilt publiceren.'},400);
  input.events=input.events??{};
  if(typeof input.events!=='object'||Array.isArray(input.events)||Object.keys(input.events).length>200)return json({error:'Ongeldige evenementselectie.'},400);
  for(const [id,version] of Object.entries({...input.places,...input.events}))if(!/^[a-f0-9-]{36}$/.test(id)||typeof version!=='number'||!Number.isInteger(version)||version<1)return json({error:'Ongeldige zaakselectie.'},400);
  const {data:job,error}=await db.rpc('request_full_content_publication',{p_places:input.places,p_events:input.events,p_actor_id:actor!.id});if(error)throw error;
  try{
   const deployment=await vercel('/v13/deployments?forceNew=1',{name:'hondaanzee',project:projectId,target:'production',gitSource:{type:'github',repoId:1139323284,ref:'main'},meta:{haz_job_id:job.id,haz_release_id:job.release_id},projectSettings:{buildCommand:`HAZ_RELEASE_ID=${job.release_id} npm run build`}});
   const {error:updateError}=await db.from('publication_jobs').update({status:'building',deployment_id:deployment.id,deployment_url:`https://${deployment.url}`,updated_at:new Date().toISOString()}).eq('id',job.id);if(updateError)throw updateError;
   return json({job:{...job,status:'building',deployment_id:deployment.id}},202);
  }catch(error){
   // A timeout may have created a deployment. Reconcile via metadata before
   // allowing any subsequent release; do not call a pending request "failed".
   const explicit=error instanceof Error&&/^VERCEL_[45][0-9]{2}$/.test(error.message);
   await db.from('publication_jobs').update({...(explicit?{status:'failed'}:{}),error_message:explicit?'Vercel heeft de publicatie geweigerd. Probeer opnieuw.':'De deploymentstatus wordt gecontroleerd. Start nog geen tweede publicatie.',updated_at:new Date().toISOString()}).eq('id',job.id);
   return json({error:explicit?'Vercel heeft de publicatie geweigerd.':'Het verzoek is ingediend; de deploymentstatus wordt gecontroleerd.'},explicit?502:202);
  }
 }catch(error){
  const message=typeof error==='object'&&error&&'message'in error?String(error.message):'';
  if(message.includes('PUBLICATION_BUSY'))return json({error:'Er loopt al een publicatie. Wacht tot deze klaar is.'},409);
  if(message.includes('VERSION_CONFLICT'))return json({error:'Een geselecteerd concept is gewijzigd. Vernieuw de lijst.'},409);
  if(message.includes('INCOMPLETE_EVENT'))return json({error:'Vul titel, datum, beschrijving, plaats en locatie in voor je publiceert.'},400);
  if(message.includes('INCOMPLETE_PLACE'))return json({error:'Vul naam, beschrijving, adres en een gecontroleerde foto in voor je publiceert.'},400);
  if(message.includes('NO_CHANGES_SELECTED'))return json({error:'Selecteer minstens één concept.'},400);
  console.error('publication failed',{type:error instanceof Error?error.name:'unknown'});return json({error:'De publicatiestatus kon niet verwerkt worden. Je concepten zijn behouden.'},503);
 }
});
