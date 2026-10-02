import React,{useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,Upload,ImagePlus,X} from 'lucide-react';
import {adminFunction} from '../../utils/adminContent.ts';
type Asset={id:string;public_url:string;alt_text:string};
export type PlaceMedia={image:string;images:string[];imagePosition:string};
async function prepareImage(file:File){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('Kies een JPEG-, PNG- of WebP-afbeelding van maximaal 20 MB.');
 const bitmap=await createImageBitmap(file);try{
 if(bitmap.width*bitmap.height>40000000)throw new Error('De originele foto is te groot (maximaal 40 megapixels).');
 const ratio=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
 const context=canvas.getContext('2d');if(!context)throw new Error('Je browser ondersteunt geen beeldverwerking.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Kon de foto niet voorbereiden.')),'image/webp',.82));
 if(blob.type!=='image/webp'||blob.size>2*1024*1024)throw new Error('Deze foto blijft te groot. Kies een kleinere afbeelding.');return blob;
 }finally{bitmap.close();}
}
export default function AdminMediaPicker({value,onChange,disabled}:{value:PlaceMedia;onChange:(value:PlaceMedia)=>void;disabled:boolean}){
 const [status,setStatus]=useState<{ready:boolean;message:string}|null>(null),[assets,setAssets]=useState<Asset[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[alt,setAlt]=useState('');
 const input=useRef<HTMLInputElement>(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;void adminFunction<{ready:boolean;message:string}>('admin-media',{action:'status'}).then(data=>{if(alive.current)setStatus(data);}).catch(e=>{if(alive.current)setError(e.message);});void adminFunction<{assets:Asset[]}>('admin-media',{action:'list'}).then(data=>{if(alive.current)setAssets(data.assets);}).catch(e=>{if(alive.current)setError(e.message);});return()=>{alive.current=false;};},[]);
 const photos=value.images.length?value.images:value.image?[value.image]:[];
 const mainOutsideGallery=!!value.image&&!photos.includes(value.image);
 const updatePhotos=(next:string[])=>onChange({...value,images:next,image:next.includes(value.image)?value.image:next[0]||''});
 const upload=async(file:File)=>{
  setBusy(true);setError('');try{
   const blob=await prepareImage(file);
   const signed=await adminFunction<{id:string;url:string;headers:Record<string,string>}>('admin-media',{action:'request',byteSize:blob.size,altText:alt.trim()});
   const uploaded=await fetch(signed.url,{method:'PUT',headers:signed.headers,body:blob});if(!uploaded.ok)throw new Error('De rechtstreekse R2-upload is mislukt. Probeer opnieuw.');
   const {asset}=await adminFunction<{asset:Asset}>('admin-media',{action:'complete',id:signed.id});
   if(alive.current){setAssets(previous=>[asset,...previous]);updatePhotos([...photos,asset.public_url]);setAlt('');}
  }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Upload mislukt.');}finally{if(alive.current)setBusy(false);if(input.current)input.current.value='';}
 };
 return <section className="workspace-panel workspace-form"><h2>Foto’s</h2><p className="workspace-note">Kies de hoofdfoto en de galerijvolgorde. Je bewaart deze selectie met het concept. Een foto uit de selectie halen verwijdert het bestand niet.</p>
 <div className="workspace-media-grid">{mainOutsideGallery&&<div><img src={value.image} alt="Bestaande hoofdfoto" style={{objectPosition:value.imagePosition}}/><p className="workspace-note">Bestaande hoofdfoto · buiten de galerij</p></div>}{photos.map((url,index)=><div key={`${url}-${index}`}><img src={url} alt={`Foto ${index+1}`} style={{objectPosition:url===value.image?value.imagePosition:undefined}}/><div className="workspace-media-tools"><button type="button" disabled={disabled||busy} className={url===value.image?'is-active':''} onClick={()=>onChange({...value,image:url})}>{url===value.image?'Hoofdfoto':'Maak hoofdfoto'}</button><button type="button" aria-label={`Foto ${index+1} naar boven`} disabled={disabled||busy||index===0} onClick={()=>{const next=[...photos];[next[index-1],next[index]]=[next[index],next[index-1]];updatePhotos(next);}}><ArrowUp size={14}/></button><button type="button" aria-label={`Foto ${index+1} naar beneden`} disabled={disabled||busy||index===photos.length-1} onClick={()=>{const next=[...photos];[next[index+1],next[index]]=[next[index],next[index+1]];updatePhotos(next);}}><ArrowDown size={14}/></button><button type="button" aria-label={`Foto ${index+1} uit selectie halen`} disabled={disabled||busy} onClick={()=>updatePhotos(photos.filter((_,i)=>i!==index))}><X size={14}/></button></div></div>)}</div>
 {value.image&&<label>Uitsnede hoofdfoto<select value={value.imagePosition||'center'} disabled={disabled||busy} onChange={event=>onChange({...value,imagePosition:event.target.value})}><option value={value.imagePosition||'center'}>Huidige uitsnede ({value.imagePosition||'center'})</option>{['center','center top','center bottom','left center','right center'].filter(position=>position!==value.imagePosition).map(position=><option key={position}>{position}</option>)}</select></label>}
 {disabled?<p className="workspace-note">Sla de nieuwe zaak eerst op als concept om foto’s te kiezen.</p>:<><p className="workspace-note">{status?.message||'R2-upload controleren…'}</p><label>Beschrijving van je nieuwe foto<input value={alt} onChange={event=>setAlt(event.target.value)} maxLength={300} disabled={busy||!status?.ready} placeholder="Bijvoorbeeld: terras van de zaak met waterbak"/></label><input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={event=>{if(event.target.files?.[0])void upload(event.target.files[0]);}}/><button type="button" className="workspace-button" disabled={busy||!status?.ready||!alt.trim()||photos.length>=30} onClick={()=>input.current?.click()}><Upload size={16}/>{busy?'Foto uploaden en controleren…':'Nieuwe foto via R2'}</button></>}
 {assets.length>0&&<details><summary><ImagePlus size={16}/> Kies uit je R2-beeldbank</summary><div className="workspace-media-grid">{assets.filter(asset=>!photos.includes(asset.public_url)).map(asset=><button type="button" key={asset.id} disabled={disabled||busy||photos.length>=30} onClick={()=>updatePhotos([...photos,asset.public_url])}><img src={asset.public_url} alt={asset.alt_text}/><span>{asset.alt_text}</span></button>)}</div></details>}
 {error&&<p className="workspace-error" role="alert">{error}</p>}</section>;
}
