import React from 'react';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAnalytics() {
  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">Begrijp wat je gids oplevert</p><h1>Analytics</h1><p>Van een bekeken zaakpagina naar een klik op website, route of telefoon.</p></div><span className="workspace-status">Nog niet geactiveerd</span></div>
    <section className="workspace-panel workspace-empty"><BarChart3 size={32} /><h2>Hier begint je eigen bezoekersmeting.</h2><p>Zodra de meting is geactiveerd, zie je hier echte paginaweergaven en contactacties. Er zijn nog geen eigen meetgegevens beschikbaar.</p><Link to="/admin/zaken" className="workspace-button">Bekijk je zaken <ArrowRight size={16} /></Link></section>
  </>;
}
