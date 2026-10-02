import {adminFunction} from '../../utils/adminContent.ts';
import React,{useEffect,useState} from 'react';
import { BarChart3, Bell, ExternalLink, LayoutDashboard, Loader2, LogOut, PawPrint, ScrollText, ShieldCheck, Store, UploadCloud, Users } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import AdminLoginCard from '../meldpunt/AdminLoginCard.tsx';
import { useAdminAuth } from '../../utils/useAdminAuth.ts';
import { useSEO } from '../../utils/seo.ts';
import '../../admin.css';

const navigation = [
  { path: '/admin', label: 'Overzicht', icon: LayoutDashboard, end: true },
  { path: '/admin/zaken', label: 'Zaken', icon: Store },
  { path: '/admin/losloopzones', label: 'Losloopzones', icon: PawPrint },
  { path: '/admin/reviews', label: 'Reviews', icon: ShieldCheck },
  { path: '/admin/publiceren', label: 'Publiceren', icon: UploadCloud },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/leden', label: 'Leden', icon: Users },
  { path: '/admin/meldpunt', label: 'Meldpunt', icon: ShieldCheck },
  { path: '/admin/log', label: 'Logboek', icon: ScrollText },
  { path: '/admin/notificaties', label: 'Notificaties', icon: Bell },
];

export default function AdminWorkspace() {
  const auth = useAdminAuth();
  const [attention,setAttention]=useState(0);
  useEffect(()=>{if(!auth.session || auth.adminAccess!=='allowed'){setAttention(0);return;}let alive=true;const refresh=()=>{if(!document.hidden)void adminFunction<{counts:{attention:number}}> ('admin-reviews',{action:'overview'}).then(data=>{if(alive)setAttention(data.counts.attention);}).catch(()=>{});};refresh();const timer=setInterval(refresh,30000);window.addEventListener('haz-review-moderated',refresh);return()=>{alive=false;clearInterval(timer);window.removeEventListener('haz-review-moderated',refresh);};},[auth.session?.access_token,auth.adminAccess]);
  const { pathname } = useLocation();
  const current = navigation.find(item => item.end ? pathname === item.path : pathname.startsWith(item.path));
  useSEO({ title: `${current?.label || 'Admin'} | HondAanZee.be`, description: 'De beheeromgeving van Hond aan Zee.', canonical: `https://hondaanzee.be${pathname}`, noindex: true });

  return (
    <div className="admin-workspace">
      <aside className="workspace-sidebar">
        <Link to="/admin" className="workspace-brand"><span className="workspace-brand-mark"><PawPrint size={22} /></span><span>hond aan zee<small>BEHEER JE KUSTGIDS</small></span></Link>
        <p className="workspace-nav-label">Werkruimte</p>
        <nav aria-label="Adminnavigatie">
          {navigation.map(({ path, label, icon: Icon, end }) => <NavLink key={path} to={path} end={end} className={({ isActive }) => `workspace-nav${isActive ? ' is-active' : ''}`}><Icon size={19} /><span>{label}</span>{path==='/admin/reviews'&&attention>0&&<span className="workspace-nav-count" aria-label={`${attention} reviews te beoordelen`}>{attention}</span>}</NavLink>)}
        </nav>
        <div className="workspace-sidebar-footer">
          <Link to="/" className="workspace-nav"><ExternalLink size={18} /><span>Bekijk de website</span></Link>
          {auth.session && <button type="button" className="workspace-nav" onClick={() => void auth.signOut()}><LogOut size={18} /><span>Uitloggen</span></button>}
          <p>{auth.session?.user.email || 'Hond aan Zee beheer'}</p>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar"><span>Hond aan Zee <span className="workspace-breadcrumb-divider">/</span> <strong>{current?.label || 'Admin'}</strong></span><span className="workspace-status">Beheeromgeving</span></header>
        <div className="workspace-content">
          {!auth.session ? <AdminLoginCard authLoading={auth.authLoading} email={auth.email} onEmailChange={auth.setEmail} onPasswordChange={auth.setPassword} onSubmit={auth.signIn} password={auth.password} sessionLoading={auth.sessionLoading} /> : auth.adminAccess === 'allowed' ? <Outlet /> : auth.adminAccess === 'loading' ? <div className="workspace-empty" role="status"><Loader2 size={25} className="animate-spin" /><p>Beheertoegang controleren…</p></div> : <div className="workspace-empty"><ShieldCheck size={30} /><h1>{auth.adminAccess === 'error' ? 'Je toegang kon niet worden gecontroleerd.' : 'Dit account heeft geen beheertoegang.'}</h1><p>{auth.adminAccess === 'error' ? 'Controleer je verbinding en probeer opnieuw.' : 'Je favorieten en uitstapjes vind je in je eigen account.'}</p>{auth.adminAccess === 'error' ? <button className="workspace-button" onClick={auth.retryAdminAccess}>Probeer opnieuw</button> : <Link to="/account" className="workspace-button">Naar mijn account</Link>}</div>}
          {auth.authError && <p className="workspace-error" role="alert">{auth.authError}</p>}
        </div>
        <footer className="workspace-footer">Een werkplek voor een betere dag aan zee.</footer>
      </div>
    </div>
  );
}
