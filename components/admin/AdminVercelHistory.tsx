import React from 'react';
import AdminAnalyticsChart from './AdminAnalyticsChart.tsx';
import { Download, History } from 'lucide-react';
type HistoricalRow={timestamp:string;pageviews:number;visitors:number;requestPath?:string;referrerHostname?:string;deviceType?:string};
export type VercelHistory={capturedAt:string;timezone:string;datasets:Record<'daily'|'pages'|'referrers'|'devices',{query:{since:string;until:string};data:HistoricalRow[]}>;lifetime:{query:{since:string;until:string};data:{pageviews:number;visitors:number}}};
const number=(v:number)=>new Intl.NumberFormat('nl-BE').format(v);
const date=(v:string)=>new Date(v).toLocaleDateString('nl-BE',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
export default function AdminVercelHistory({history}:{history:VercelHistory|null}){
 if(!history)return <section className="workspace-panel"><h2>Vercel-historiek</h2><p>Er is nog geen historische export beschikbaar.</p></section>;
 const daily=history.datasets.daily.data,total=daily.reduce((s,r)=>s+r.pageviews,0);
 const list=(title:string,key:'pages'|'referrers'|'devices',field:'requestPath'|'referrerHostname'|'deviceType')=>{
  const counts=new Map<string,number>();for(const row of history.datasets[key].data){const name=row[field]||'Rechtstreeks / onbekend';counts.set(name,(counts.get(name)||0)+row.pageviews);}
  return <section className="workspace-panel"><h2>{title}</h2><div className="workspace-analytics-list">{[...counts].sort((a,b)=>b[1]-a[1]).slice(0,20).map(([name,count])=><div key={name}><span>{name==='Others'?'Overige':name}</span><strong>{number(count)}</strong></div>)}</div></section>;
 };
 const csv=()=>{
  const quote=(v:unknown)=>`"${String(v).replaceAll('"','""')}"`;
  const rows=['Bron,Dimensie,Datum UTC,Waarde,Paginaweergaven,Bezoekers Vercel'];
  for(const [name,data]of Object.entries(history.datasets))for(const r of data.data)rows.push(['Vercel',name,r.timestamp.slice(0,10),r.requestPath??r.referrerHostname??r.deviceType??'',r.pageviews,r.visitors].map(quote).join(','));
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='hondaanzee-vercel-historiek.csv';a.click();URL.revokeObjectURL(url);
 };
 return <><p className="workspace-note">Bewaarde export van Vercel · {new Date(history.capturedAt).toLocaleString('nl-BE')} · Afzonderlijk van de eigen meting, zodat overlappende weergaven niet dubbel meetellen.</p>
 <div className="workspace-stats"><section className="workspace-stat"><span>Historische paginaweergaven</span><strong>{number(history.lifetime.data.pageviews)}</strong><small>{date(history.lifetime.query.since)} tot het exportmoment</small></section><section className="workspace-stat"><span>Historische bezoekers</span><strong>{number(history.lifetime.data.visitors)}</strong><small>Unieke bezoekers volgens Vercel</small></section><section className="workspace-stat"><span>Paginaweergaven met dagdetails</span><strong>{number(total)}</strong><small>{date(daily[0].timestamp)} – {date(daily.at(-1)!.timestamp)}</small></section></div>
 <section className="workspace-panel"><div className="workspace-section-heading"><div><h2><History size={20}/> De bewaarde Vercel-historiek</h2><p className="workspace-muted">De laatste dag is gedeeltelijk: gemeten tot het exportmoment.</p></div><button className="workspace-button" onClick={csv}><Download size={16}/>CSV</button></div><AdminAnalyticsChart points={daily.map((r,index)=>({day:r.timestamp.slice(0,10),value:r.pageviews,details:[{label:'Bezoekers volgens Vercel',value:r.visitors}],partial:index===daily.length-1}))} source="Vercel · UTC" label={`${number(total)} historische paginaweergaven`}/><details><summary>Cijfers per dag</summary><div className="workspace-analytics-list">{daily.map(r=><div key={r.timestamp}><span>{date(r.timestamp)} · {number(r.visitors)} bezoekers</span><strong>{number(r.pageviews)}</strong></div>)}</div></details></section>
 <div className="workspace-columns">{list('Historisch populaire pagina’s','pages','requestPath')}{list('Historische verkeersbronnen','referrers','referrerHostname')}{list('Historische apparaten','devices','deviceType')}</div>
 <p className="workspace-note">Vercel Hobby geeft maximaal 31 dagen detailrapportage. Oudere cijfers zijn als oorspronkelijke totaaltelling bewaard. Daggrenzen zijn UTC; de nieuwe meting gebruikt Brussel. Historische contactevents zijn niet toegankelijk op dit plan. Bezoekers per dag worden niet opgeteld tot een unieke periodetelling. Vercel groepeert minder populaire waarden onder ‘Overige’.</p></>;
}
