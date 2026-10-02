const fs=require('node:fs');const path=require('node:path');const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
async function prepareCatalog(){
 const token=process.env.CATALOG_BUILD_TOKEN,release=process.env.HAZ_RELEASE_ID;
 let catalog={releaseId:null,hotspots:null,services:null};
 if(release&&!token)throw new Error('An exact release requires CATALOG_BUILD_TOKEN.');
 if(process.env.VERCEL_ENV==='production'&&!token)throw new Error('Production requires catalog build configuration.');
 if(token){
  const url=new URL('https://zpllibfxaizavcvztnut.supabase.co/functions/v1/catalog-build');if(release)url.searchParams.set('release',release);
  const response=await fetch(url,{headers:{'x-catalog-build-token':token},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`Catalog snapshot unavailable: HTTP ${response.status}`);
  const body=await response.json();
  if(release&&body.releaseId!==release)throw new Error('Catalog release mismatch.');
  if(body.releaseId){
   if(createHash('sha256').update(body.snapshotJson).digest('hex')!==body.sha256)throw new Error('Catalog integrity mismatch.');
   const snapshot=JSON.parse(body.snapshotJson);
   const {CITIES}=require('./place-data.cjs');const {validatePlaceData}=require('./validate-place-data.cjs');
   validatePlaceData({HOTSPOTS:snapshot.hotspots,SERVICES:snapshot.services,CITIES});
   catalog={releaseId:body.releaseId,sha256:body.sha256,hotspots:snapshot.hotspots,services:snapshot.services};
  }
 }
 fs.writeFileSync(path.join(root,'data/dashboardCatalog.json'),JSON.stringify(catalog));
 fs.writeFileSync(path.join(root,'public/catalog-release.json'),JSON.stringify({releaseId:catalog.releaseId,sha256:catalog.sha256||null}));
 console.log(catalog.releaseId?`Using immutable catalog release ${catalog.releaseId}`:'Using the original Git catalog (no dashboard release yet).');
}
if(require.main===module)prepareCatalog().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={prepareCatalog};
