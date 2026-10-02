import React from 'react';
import { ArrowRight, BarChart3, Bell, ShieldCheck, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOTSPOTS, SERVICES } from '../data/index.ts';

export default function AdminOverview() {
  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">Je kustgids, in één oogopslag</p><h1>Je kustgids begint hier.</h1><p>Beheer je hondvriendelijke adressen en hou je website in beweging.</p></div><Link to="/admin/zaken" className="workspace-button workspace-button-primary"><Store size={17} />Bekijk je zaken</Link></div>
    <div className="workspace-stats">
      <section className="workspace-stat"><span>Zaken in je gids</span><strong>{HOTSPOTS.length + SERVICES.length}</strong><small>De bestaande catalogus</small></section>
      <section className="workspace-stat"><span>Hondvriendelijke hotspots</span><strong>{HOTSPOTS.length}</strong><small>Eten, drinken, slapen en shoppen</small></section>
      <section className="workspace-stat"><span>Diensten aan de kust</span><strong>{SERVICES.length}</strong><small>Dierenartsen en dierenspeciaalzaken</small></section>
    </div>
    <div className="workspace-columns">
      <section className="workspace-panel"><h2>Waar wil je aan werken?</h2><p className="workspace-muted">Je catalogus en bestaande beheertaken op één plek.</p>
        {[{ to: '/admin/zaken', icon: Store, title: 'Bekijk je hondvriendelijke adressen', text: 'Zoek een zaak of controleer de vermelding.' }, { to: '/admin/meldpunt', icon: ShieldCheck, title: 'Beheer het meldpunt', text: 'Bekijk meldingen en werk hun status bij.' }, { to: '/admin/notificaties', icon: Bell, title: 'Beheer je notificaties', text: 'Open je bestaande verzend- en berichtbeheer.' }].map(({ to, icon: Icon, title, text }) => <Link key={to} to={to} className="workspace-task"><span className="workspace-task-icon"><Icon size={18} /></span><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={16} /></Link>)}
      </section>
      <section className="workspace-panel workspace-analytics-empty"><BarChart3 size={24} /><h2>Wat levert je gids op?</h2><p>Volg vanaf nu echte paginaweergaven en contactkliks met je eigen meting.</p><Link to="/admin/analytics" className="workspace-text-link">Bekijk analytics <ArrowRight size={15} /></Link></section>
    </div>
    <section className="workspace-panel"><div className="workspace-section-heading"><div><h2>Van een tip naar een nieuwe zaak</h2><p className="workspace-muted">Je volgende hondvriendelijke adres begint als concept.</p></div><Link to="/admin/zaken/nieuw" className="workspace-button">Nieuwe zaak</Link></div><p className="workspace-copy">Voeg zaken toe, bekijk je concept en selecteer de wijzigingen die je wilt publiceren. Nieuwe foto's krijgen R2-opslag zodra het mediadomein actief is. Je bestaande afbeeldingen blijven op hun huidige locatie.</p></section>
  </>;
}
