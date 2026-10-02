import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMember } from './MemberProvider.tsx';
import { placeKey, rememberPendingSave, type SavedPlace } from '../../utils/memberStore.ts';

export default function SavePlaceButton({ place, compact = false, className = '' }: { place: SavedPlace; compact?: boolean; className?: string }) {
  const member = useMember(), location = useLocation(), navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const saved = member.data?.favorites.some(p => placeKey(p) === placeKey(place)) ?? false;
  const label = saved ? 'Bewaard' : 'Bewaar deze plek';
  return <button type="button" className={`member-save ${compact ? 'member-save-compact' : ''} ${saved ? 'is-saved' : ''} ${className}`} disabled={busy || member.sessionLoading || Boolean(member.session && member.loading)} aria-label={`${saved ? 'Verwijder uit' : 'Voeg toe aan'} favorieten`} title={label} aria-pressed={saved}
    onClick={async e => {
      e.preventDefault(); e.stopPropagation();
      if (!member.session) { rememberPendingSave(place); navigate(`/account?mode=register&next=${encodeURIComponent(location.pathname + location.search)}`); return; }
      if (!member.data || member.data.profile.status !== 'active') { navigate('/account'); return; }
      setBusy(true);
      try { await member.toggleFavorite(place); } catch (cause) { member.notify(cause instanceof Error ? cause.message : 'Bewaren lukte niet.'); } finally { setBusy(false); }
    }}>{busy ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={saved ? 'currentColor' : 'none'} />}{!compact && <span>{label}</span>}</button>;
}
