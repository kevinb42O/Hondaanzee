import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { useHotspotSummary, reviewScore, type HotspotRef } from '../../utils/hotspotCommunity.ts';
import './HotspotCommunity.css';

export default function HotspotSocialSummary({place,detail=false}:{place:HotspotRef;detail?:boolean}) {
 const {summary,error,loading}=useHotspotSummary(place);
 if(loading)return detail?<div className="hotspot-social-summary" aria-busy="true"><span className="hotspot-summary-skeleton"/></div>:null;
 if(error)return detail?<p className="hotspot-social-unavailable">{error}</p>:null;
 if(!summary)return null;
 const score=reviewScore(summary);
 const content=<>{score?<span><Star size={15} fill="currentColor" className="hotspot-gold"/><strong>{score}</strong><span>· {summary.count} {summary.count===1?'review':'reviews'}</span></span>:detail?<span>Nog geen reviews</span>:null}{(detail||summary.likes>0)&&<span><ThumbsUp size={14}/>{summary.likes} {summary.likes===1?'like':'likes'}</span>}</>;
 if(!detail&&!score&&!summary.likes)return null;
 return detail?<a href="#reviews" className="hotspot-social-summary hotspot-social-link">{content}</a>:<div className="hotspot-social-summary hotspot-social-card">{content}</div>;
}
