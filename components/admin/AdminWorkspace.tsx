import React from 'react';
import { BarChart3, Bell, ExternalLink, LayoutDashboard, LogOut, PawPrint, ScrollText, ShieldCheck, Store, UploadCloud } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import AdminLoginCard from '../meldpunt/AdminLoginCard.tsx';
import { useAdminAuth } from '../../utils/useAdminAuth.ts';
import { useSEO } from '../../utils/seo.ts';
import '../../admin.css';

const navigation = [
  { path: '/admin', label: 'Overzicht', icon: LayoutDashboard, end: true },
  { path: '/admin/zaken', label: 'Zaken', icon: Store },
  { path: '/admin/publiceren', label: 'Publiceren', icon: UploadCloud },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/meldpunt', label: 'Meldpunt', icon: ShieldCheck },
  { path: '/admin/log', label: 'Logboek', icon: ScrollText },
  { path: '/admin/notificaties', label: 'Notificaties', icon: Bell },
];

export default function AdminWorkspace() {
  const auth = useAdminAuth();
  const { pathname } = useLocation();
  const current = navigation.find(item => item.end ? pathname === item.path : pathname.startsWith(item.path));
  useSEO({ title: `${current?.label || 'Admin'} | HondAanZee.be`, description: 'De beheeromgeving van Hond aan Zee.', canonical: `https://hondaanzee.be${pathname}`, noindex: true });

  return (
    <div className="admin-workspace">
      <aside className="workspace-sidebar">
        <Link to="/admin" className="workspace-brand"><span className="workspace-brand-mark"><PawPrint size={22} /></span><span>hond aan zee<small>BEHEER JE KUSTGIDS</small></span></Link>
        <p className="workspace-nav-label">Werkruimte</p>
        <nav aria-label="Adminnavigatie">
          {navigation.map(({ path, label, icon: Icon, end }) => <NavLink key={path} to={path} end={end} className={({ isActive }) => `workspace-nav${isActive ? ' is-active' : ''}`}><Icon size={19} /><span>{label}</span></NavLink>)}
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
          {!auth.session ? <AdminLoginCard authLoading={auth.authLoading} email={auth.email} onEmailChange={auth.setEmail} onPasswordChange={auth.setPassword} onSubmit={auth.signIn} password={auth.password} sessionLoading={auth.sessionLoading} /> : <Outlet />}
          {auth.authError && <p className="workspace-error" role="alert">{auth.authError}</p>}
        </div>
        <footer className="workspace-footer">Een werkplek voor een betere dag aan zee.</footer>
      </div>
    </div>
  );
}
