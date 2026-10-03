import React,{useEffect,useState} from 'react';
import {adminEvents,type EventRecord} from '../utils/adminEvents.ts';
import {isEventPast} from '../utils/events.ts';
import { ArrowRight, BarChart3, Bell, CalendarDays, Heart, ShieldCheck, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOTSPOTS, SERVICES, OFF_LEASH_AREAS } from '../data/index.ts';

export default function AdminOverview() {
  const [agenda,setAgenda]=useState<EventRecord[]|null>(null),[agendaError,setAgendaError]=useState('');
  useEffect(()=>{let alive=true;void adminEvents<{events:EventRecord[]}>({action:'list'}).then(data=>{if(alive)setAgenda(data.events);}).catch(e=>{if(alive)setAgendaError(e.message);});return()=>{alive=false;};},[]);
  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">Je kustgids, in één oogopslag</p><h1>Je kustgids begint hier.</h1><p>Beheer je hondvriendelijke adressen en hou je website in beweging.</p></div><Link to="/admin/zaken" className="workspace-button workspace-button-primary"><Store size={17} />Bekijk je zaken</Link></div>
    <div className="workspace-stats">
      <section className="workspace-stat"><span>Zaken in je gids</span><strong>{HOTSPOTS.length + SERVICES.length}</strong><small>De bestaande catalogus</small></section>
      <section className="workspace-stat"><span>Hondvriendelijke hotspots</span><strong>{HOTSPOTS.length}</strong><small>Eten, drinken, slapen en shoppen</small></section>
      <section className="workspace-stat"><span>Diensten aan de kust</span><strong>{SERVICES.length}</strong><small>Dierenartsen en dierenspeciaalzaken</small></section>
      <section className="workspace-stat"><span>Losloopzones</span><strong>{OFF_LEASH_AREAS.length}</strong><small>Locaties en bezoekerservaringen</small></section>
    </div>
    <section className="workspace-panel workspace-agenda-summary"><div className="workspace-section-heading"><h2><CalendarDays size={20}/>Je agenda</h2><Link to="/admin/agenda" className="workspace-button">Agenda beheren</Link></div>{agendaError?<p className="workspace-error" role="alert">{agendaError}</p>:agenda?<p>{agenda.length} evenementen · {agenda.filter(e=>e.draft_revision_id!==e.published_revision_id).length} concepten te publiceren · {agenda.filter(e=>!isEventPast(e.draft.content)&&(!e.draft.content.sources?.length||!e.draft.content.lastVerified||e.draft.content.status!=='confirmed')).length} komende edities met informatie om te controleren.</p>:<p role="status">Agenda laden…</p>}</section>
    <div className="workspace-columns">
      <section className="workspace-panel"><h2>Waar wil je aan werken?</h2><p className="workspace-muted">Je catalogus en bestaande beheertaken op één plek.</p>
        {[{to:'/admin/agenda',icon:CalendarDays,title:'Beheer je agenda',text:'Bewerk evenementen, publiceer nieuwe edities en bekijk hun bereik.'},{to:'/admin/agenda/analytics',icon:BarChart3,title:'Bekijk je agenda in cijfers',text:'Weergaven en ticket- of contactklikken per evenement.'},{to:'/admin/favorieten',icon:Heart,title:'Ontdek wat je leden bewaren',text:'Populaire plekken, recente favorieten en interesse per gemeente.'},{to:'/admin/losloopzones',icon:Store,title:'Beheer je losloopzones',text:'Controleer locaties, praktische informatie en foto’s.'},{to:'/admin/reviews?view=insights',icon:ShieldCheck,title:'Volg likes en bezoekersreviews',text:'Waardering per plek, sterren, recente likes en reviews beoordelen.'},{ to: '/admin/zaken', icon: Store, title: 'Bekijk je hondvriendelijke adressen', text: 'Zoek een zaak of controleer de vermelding.' }, { to: '/admin/meldpunt', icon: ShieldCheck, title: 'Beheer het meldpunt', text: 'Bekijk meldingen en werk hun status bij.' }, { to: '/admin/notificaties', icon: Bell, title: 'Beheer je notificaties', text: 'Open je bestaande verzend- en berichtbeheer.' }].map(({ to, icon: Icon, title, text }) => <Link key={to} to={to} className="workspace-task"><span className="workspace-task-icon"><Icon size={18} /></span><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={16} /></Link>)}
      </section>
      <section className="workspace-panel workspace-analytics-empty"><BarChart3 size={24} /><h2>Wat levert je gids op?</h2><p>Volg vanaf nu echte paginaweergaven en contactkliks met je eigen meting.</p><Link to="/admin/analytics" className="workspace-text-link">Bekijk analytics <ArrowRight size={15} /></Link></section>
    </div>
    <section className="workspace-panel"><div className="workspace-section-heading"><div><h2>Van een tip naar een nieuwe zaak</h2><p className="workspace-muted">Je volgende hondvriendelijke adres begint als concept.</p></div><Link to="/admin/zaken/nieuw" className="workspace-button">Nieuwe zaak</Link></div><p className="workspace-copy">Voeg zaken toe, bekijk je concept en selecteer de wijzigingen die je wilt publiceren. Nieuwe foto's krijgen R2-opslag zodra het mediadomein actief is. Je bestaande afbeeldingen blijven op hun huidige locatie.</p></section>
  </>;
}
