import React, { useId } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps { rating:number; max?:number; size?:number; onRate?:(rating:number)=>void; readOnly?:boolean; className?:string }
export default function StarRating({rating,max=5,size=20,onRate,readOnly=false,className=''}:StarRatingProps) {
 const group=useId();
 const stars=Array.from({length:max},(_,i)=>i+1);
 const icon=(value:number)=><span style={{position:'relative',display:'inline-flex',width:size,height:size}} aria-hidden="true"><Star size={size} className="text-slate-300" strokeWidth={1.5}/><span style={{position:'absolute',inset:0,width:`${Math.max(0,Math.min(1,rating-value+1))*100}%`,overflow:'hidden'}}><Star size={size} className="fill-amber-400 text-amber-400" strokeWidth={1.5}/></span></span>;
 if(readOnly)return <span role="img" aria-label={`${Number(rating).toLocaleString('nl-BE')} van ${max} sterren`} className={`inline-flex items-center gap-1 ${className}`}>{stars.map(n=><React.Fragment key={n}>{icon(n)}</React.Fragment>)}</span>;
 return <span className={`inline-flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Sterrenbeoordeling">{stars.map(n=><label key={n} className="relative inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md hover:bg-amber-50"><input className="peer sr-only" type="radio" name={group} value={n} checked={rating===n} onChange={()=>onRate?.(n)} aria-label={`${n} ${n===1?'ster':'sterren'}`}/><span className="inline-flex rounded-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-sky-600">{icon(n)}</span></label>)}</span>;
}
