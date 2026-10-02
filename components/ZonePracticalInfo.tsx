import React from 'react';
import type{OffLeashArea}from'../types.ts';import{zoneAvailability}from'../utils/zoneAvailability.ts';
const features={fenced:'Omheining',water:'Water',parking:'Parking',accessible:'Toegankelijkheid'};
export default function ZonePracticalInfo({zone}:{zone:OffLeashArea}){
 const availability=zoneAvailability(zone);
 return <div className="zone-practical-info"><div className={`zone-availability ${availability.open===false?'zone-availability-closed':''}`}><strong>{availability.label}</strong>{zone.operationalStatus==='temporarily_closed'&&<p>{zone.closureNote}{zone.reopensOn?` · Verwachte heropening: ${zone.reopensOn}`:''}</p>}</div>{Object.entries(zone.features||{}).filter(([,v])=>v!=='unknown').length>0&&<div className="zone-feature-list">{Object.entries(zone.features||{}).filter(([,v])=>v!=='unknown').map(([key,value])=><span key={key}>{features[key as keyof typeof features]}: {value==='yes'?'Ja':'Nee'}</span>)}</div>}{zone.lastVerifiedAt&&<p className="zone-verified">Gecontroleerd op {new Date(`${zone.lastVerifiedAt}T12:00:00Z`).toLocaleDateString('nl-BE')}{zone.sourceUrl&&<> · <a href={zone.sourceUrl} target="_blank" rel="noreferrer">Bron</a></>}</p>}</div>;
}
