import type { OffLeashArea } from '../types.ts';
export function zoneAvailability(zone:OffLeashArea,now=new Date()){
 if(zone.operationalStatus==='temporarily_closed')return {open:false,label:'Tijdelijk gesloten'};
 if(zone.access==='always')return {open:true,label:'Altijd toegankelijk'};
 if((zone.access==='hours'||!zone.access)&&zone.openingHours){
  const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Brussels',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const{open,close}=zone.openingHours;
  const isOpen=open===close?false:open<close?time>=open&&time<close:time>=open||time<close;
  return {open:isOpen,label:`${open}–${close} · ${isOpen?'Nu open':'Nu gesloten'}`};
 }
 return {open:null,label:'Openingstijden niet bevestigd'};
}
