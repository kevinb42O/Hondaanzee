import React, { useId, useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

interface StarRatingProps {
 rating:number; max?:number; size?:number; onRate?:(rating:number)=>void;
 onPreview?:(rating:number|null)=>void; readOnly?:boolean; disabled?:boolean; className?:string;
}
export default function StarRating({rating,max=5,size=20,onRate,onPreview,readOnly=false,disabled=false,className=''}:StarRatingProps) {
 const group=useId();
 const [hovered,setHovered]=useState<number|null>(null),[focused,setFocused]=useState<number|null>(null);
 const preview=disabled?null:hovered??focused;
 const displayed=readOnly?rating:preview??rating;
 const stars=Array.from({length:max},(_,i)=>i+1);
 const icon=(value:number)=><span className="star-rating-icon" style={{width:size,height:size}} aria-hidden="true"><Star size={size} className="star-rating-outline" strokeWidth={1.5}/><span className="star-rating-fill" style={{width:`${Math.max(0,Math.min(1,displayed-value+1))*100}%`}}><Star size={size} strokeWidth={1.5}/></span></span>;
 if(readOnly)return <span role="img" aria-label={`${Number(rating).toLocaleString('nl-BE')} van ${max} sterren`} className={`star-rating star-rating-readonly ${className}`}>{stars.map(n=><React.Fragment key={n}>{icon(n)}</React.Fragment>)}</span>;
 return <span className={`star-rating star-rating-interactive ${preview!==null?'is-previewing':''} ${className}`} role="radiogroup" aria-label="Sterrenbeoordeling" aria-disabled={disabled||undefined} onPointerLeave={()=>{setHovered(null);onPreview?.(focused);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setFocused(null);onPreview?.(hovered);}}}>
  {stars.map(n=><label key={n} className={`star-rating-option ${n<=displayed?'is-filled':''} ${n===preview?'is-active':''} ${n===rating?'is-selected':''}`} style={{'--star-delay':`${(n-1)*22}ms`} as React.CSSProperties} onPointerEnter={e=>{if(!disabled&&e.pointerType!=='touch'){setHovered(n);onPreview?.(n);}}}>
   <input className="sr-only" type="radio" name={group} value={n} checked={rating===n} disabled={disabled} onChange={()=>onRate?.(n)} onFocus={e=>{const next=!disabled&&e.currentTarget.matches(':focus-visible')?n:null;setFocused(next);onPreview?.(hovered??next);}} aria-label={`${n} ${n===1?'ster':'sterren'}`}/>
   {icon(n)}
  </label>)}
 </span>;
}
