import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Heart, MapPin, PawPrint, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveSavedPlace, type SavedPlace } from '../../utils/memberData.ts';
import SavePlaceButton from './SavePlaceButton.tsx';

export function MemberDialog({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className={`member-dialog ${wide ? 'member-dialog-wide' : ''}`} aria-labelledby="member-dialog-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className="member-dialog-head"><h2 id="member-dialog-title">{title}</h2><button className="member-icon-button" type="button" onClick={onClose} aria-label="Venster sluiten"><X size={21} /></button></div>
    {children}
  </dialog>;
}
export function MemberEmpty({ icon = 'heart', title, text, children }: { icon?: 'heart' | 'paw' | 'map'; title: string; text: string; children?: React.ReactNode }) {
  const Icon = icon === 'paw' ? PawPrint : icon === 'map' ? MapPin : Heart;
  return <div className="member-empty"><span className={`member-empty-icon ${icon}`}><Icon size={28} strokeWidth={1.6} /></span><h3>{title}</h3><p>{text}</p>{children}</div>;
}
export function SavedPlaceCard({ place, action }: { place: SavedPlace; action?: React.ReactNode }) {
  const resolved = resolveSavedPlace(place);
  if (!resolved) return <article className="member-place-card member-unavailable"><div><MapPin size={26} /><h3>Deze plek staat niet meer in de gids</h3><p>Je kunt ze uit je favorieten halen.</p><SavePlaceButton place={place} /></div></article>;
  return <article className="member-place-card">
    <div className="member-place-image"><Link to={resolved.path} tabIndex={-1} aria-hidden="true"><img src={resolved.image} alt="" loading="lazy" /></Link><span>{resolved.category}</span><SavePlaceButton place={place} compact /></div>
    <div className="member-place-copy"><p><MapPin size={13} />{resolved.cityName}</p><h3><Link to={resolved.path}>{resolved.name}<ArrowUpRight size={17} /></Link></h3>{action}</div>
  </article>;
}
export const memberDate = (value?: string | null) => value ? new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Brussels' }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value)) : '—';
