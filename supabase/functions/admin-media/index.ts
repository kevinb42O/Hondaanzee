import {z} from 'zod';
import {getSupabaseAdmin,handleOptions,json} from '../_shared/http.ts';
import {requireAdminUser} from '../_shared/security.ts';
import {r2Client,r2ObjectUrl,mediaBase} from '../_shared/r2.ts';
import {checkWebpHeader,MAX_IMAGE_EDGE,MAX_UPLOAD_BYTES} from '../_shared/imageValidation.ts';
const request=z.discriminatedUnion('action',[
 z.object({action:z.literal('check-runtime')}).strict(),z.object({action:z.literal('status')}).strict(),z.object({action:z.literal('list')}).strict(),
 z.object({action:z.literal('request'),byteSize:z.number().int().positive().max(MAX_UPLOAD_BYTES),altText:z.string().trim().min(1).max(300)}).strict(),
 z.object({action:z.literal('complete'),id:z.uuid()}).strict(),
]);
let decoder:Promise<typeof import('npm:@imagemagick/magick-wasm@0.0.44')>|null=null;
function imageDecoder(){return decoder ||= (async()=>{
 const magick=await import('npm:@imagemagick/magick-wasm@0.0.44');
 // The API bundler cannot include binary static files. Load a pinned official
 // npm runtime from our private R2 bucket, with a mandatory integrity check.
 const runtime=await r2Client().fetch(r2ObjectUrl('hondaanzee-uploads','runtime/magick-0.0.44.wasm'),{signal:AbortSignal.timeout(20000)});
 if(!runtime.ok)throw new Error('Image runtime unavailable');
 const bytes=new Uint8Array(await runtime.arrayBuffer());
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
 if(digest!=='b7d6710436b150dc5bd1ca04d80b6b7614c54854d7470f888f7e69a2a41b00e4')throw new Error('Image runtime integrity mismatch');
 await magick.initializeImageMagick(bytes);
 magick.ResourceLimits.memory=80000000n;magick.ResourceLimits.disk=0n;magick.ResourceLimits.width=BigInt(MAX_IMAGE_EDGE);magick.ResourceLimits.height=BigInt(MAX_IMAGE_EDGE);magick.ResourceLimits.area=3240000n;magick.ResourceLimits.listLength=16n;magick.ResourceLimits.maxProfileSize=1048576n;
 return magick;
})();}
Deno.serve(async req=>{
 const options=handleOptions(req);if(options)return options;
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 let actor;try{actor=await requireAdminUser(req);}catch{return json({error:'Log in met je beheeraccount.'},403);}
 try{
 const raw=await req.text();if(raw.length>2048)return json({error:'Te groot verzoek.'},413);
 const parsed=request.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:parsed.error.issues[0]?.message||'Controleer je upload.'},400);
 const input=parsed.data,db=getSupabaseAdmin(),base=mediaBase();
 if(input.action==='check-runtime'){const {ImageMagick,MagickFormat}=await imageDecoder();return json(ImageMagick.read(new Uint8Array([82,73,70,70,36,0,0,0,87,69,66,80,86,80,56,32,24,0,0,0,48,1,0,157,1,42,1,0,1,0,1,64,38,37,164,0,3,112,0,254,252,244,0,0]),image=>{return {ok:image.width===1&&image.height===1,width:image.width,height:image.height};}));}
 if(input.action==='status')return json({ready:!!base,maxBytes:MAX_UPLOAD_BYTES,maxEdge:MAX_IMAGE_EDGE,message:base?'Nieuwe foto’s worden via R2 opgeslagen.':'Het mediadomein wacht nog op de DNS-overstap. Uploads komen beschikbaar zodra media.hondaanzee.be actief is.'});
 if(input.action==='list'){
  const {data,error}=await db.from('media_assets').select('id,public_url,alt_text,width,height,created_at').eq('storage_provider','r2').eq('status','verified').order('created_at',{ascending:false}).limit(500);
  if(error)throw error;return json({assets:data});
 }
 if(!base)return json({error:'Het R2-mediadomein is nog niet actief. Probeer opnieuw na de DNS-overstap.'},503);
 const client=r2Client();
 if(input.action==='request'){
  const {count,error:countError}=await db.from('media_assets').select('id',{count:'exact',head:true}).eq('created_by',actor.id).gte('created_at',new Date(Date.now()-3600000).toISOString());
  if(countError)throw countError;if((count||0)>=50)return json({error:'Maximaal 50 nieuwe uploads per uur. Probeer later opnieuw.'},429);
  const id=crypto.randomUUID(),key=`staging/${id}.webp`,expires=new Date(Date.now()+10*60000).toISOString();
  const {error}=await db.from('media_assets').insert({id,storage_provider:'r2',bucket:'hondaanzee-uploads',object_key:key,status:'pending',mime_type:'image/webp',byte_size:input.byteSize,alt_text:input.altText,created_by:actor.id,expires_at:expires});if(error)throw error;
  const url=new URL(r2ObjectUrl('hondaanzee-uploads',key));url.searchParams.set('X-Amz-Expires','600');
  const signed=await client.sign(url.toString(),{method:'PUT',headers:{'Content-Type':'image/webp','If-None-Match':'*'},aws:{signQuery:true,allHeaders:true}});
  return json({id,url:signed.url,headers:{'Content-Type':'image/webp','If-None-Match':'*'},expiresAt:expires},201);
 }
 const {data:asset,error}=await db.from('media_assets').select('*').eq('id',input.id).eq('created_by',actor.id).eq('storage_provider','r2').maybeSingle();if(error)throw error;
 if(!asset)return json({error:'Upload niet gevonden.'},404);
 if(asset.status==='verified')return json({asset});
 if(asset.status!=='pending'||new Date(asset.expires_at).getTime()<Date.now())return json({error:'Deze upload is verlopen. Selecteer de afbeelding opnieuw.'},410);
 const response=await client.fetch(r2ObjectUrl('hondaanzee-uploads',asset.object_key));
 if(!response.ok)return json({error:'Upload niet ontvangen. Upload de afbeelding opnieuw.'},400);
 if(Number(response.headers.get('content-length'))!==Number(asset.byte_size)||Number(asset.byte_size)>MAX_UPLOAD_BYTES)return json({error:'Bestandsgrootte komt niet overeen met de upload.'},400);
 const bytes=new Uint8Array(await response.arrayBuffer());checkWebpHeader(bytes);
 const {ImageMagick,MagickReadSettings,MagickFormat}=await imageDecoder();
 const output=ImageMagick.read(bytes,new MagickReadSettings({format:MagickFormat.WebP,frameCount:1}),image=>{
  if(image.width>MAX_IMAGE_EDGE||image.height>MAX_IMAGE_EDGE||image.width*image.height>3240000)throw new Error('De afbeelding is te groot.');
  image.autoOrient();image.strip();image.quality=82;
  return image.write(MagickFormat.WebP,data=>({bytes:Uint8Array.from(data),width:image.width,height:image.height}));
 });
 if(output.bytes.length>MAX_UPLOAD_BYTES)throw new Error('De afbeelding is te groot.');
 const key=`zaken/${asset.id}.webp`,publicUrl=`${base}/${key}`;
 // Unique immutable public key. Repeated completion can only see our own key.
 const uploaded=await client.fetch(r2ObjectUrl('hondaanzee-media',key),{method:'PUT',headers:{'Content-Type':'image/webp','Cache-Control':'public,max-age=31536000,immutable','If-None-Match':'*'},body:output.bytes});
 if(!uploaded.ok && uploaded.status!==412)throw new Error('R2 kon de afbeelding niet opslaan.');
 const {data:verified,error:verificationError}=await db.from('media_assets').update({bucket:'hondaanzee-media',object_key:key,public_url:publicUrl,status:'verified',width:output.width,height:output.height,byte_size:output.bytes.length,verified_at:new Date().toISOString(),expires_at:null}).eq('id',asset.id).eq('status','pending').select('id,public_url,alt_text,width,height,created_at').single();
 if(verificationError)throw verificationError;
 // No deletion of original or public media. Staging expiry is handled separately.
 return json({asset:verified});
 }catch(error){console.error('admin-media failed',{type:error instanceof Error?error.name:'unknown'});return json({error:'De afbeelding kon niet gecontroleerd worden. Gebruik een andere JPEG-, PNG- of WebP-foto.'},400);}
});
