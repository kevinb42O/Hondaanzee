import type {ChartPoint} from './analyticsChart';
export type HourlyWindow={start:string;end:string;now:string;startedAt:string};
export type HourlyRow={hour?:string;event:string;count:number};
export function hourlySeries(rows:HourlyRow[],window:HourlyWindow):ChartPoint[]{
 const start=Date.parse(window.start),coverage=Date.parse(window.startedAt),current=Date.parse(window.end);
 return Array.from({length:24},(_,index)=>{
  const timestamp=start+index*3600000,measured=timestamp+3600000>coverage;
  const matching=rows.filter(row=>Date.parse(row.hour||'')===timestamp);
  const startedDuringHour=coverage>timestamp&&coverage<timestamp+3600000;
  return {day:new Date(timestamp).toISOString(),granularity:'hour',value:measured?matching.filter(r=>r.event==='pageview').reduce((sum,r)=>sum+Number(r.count),0):null,details:[{label:'Contactkliks',value:matching.filter(r=>r.event!=='pageview').reduce((sum,r)=>sum+Number(r.count),0)}],partial:timestamp===current||startedDuringHour,partialLabel:startedDuringHour?'meting gestart tijdens dit uur':timestamp===current?'lopend uur':undefined};
 });
}
