import React from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminFavoriteCounts } from '../../utils/useAdminFavoriteCounts.ts';
export function FavoriteCount({ count, error = false }: { count: number | undefined; error?: boolean }) {
  return <span className="workspace-favorite-count" title={error ? 'Favorieten konden niet worden geladen' : count === undefined ? 'Favorieten laden' : `${count} ${count === 1 ? 'account bewaart' : 'accounts bewaren'} deze plek momenteel`}><Heart size={14} aria-hidden="true" />{error ? <span className="sr-only">Niet beschikbaar</span> : count === undefined ? '…' : count.toLocaleString('nl-BE')}{error && '—'}</span>;
}
export default function AdminFavoriteCount({ id }: { id: string }) {
  const { counts, loading, error, refresh } = useAdminFavoriteCounts();
  return <div className="workspace-place-favorites"><div><FavoriteCount count={counts?.[id]} error={error} /><span>{error ? 'Bewaarstatistiek niet beschikbaar' : 'Accounts die deze plek bewaren'}</span></div><Link to={`/admin/favorieten?place=${id}`} className="workspace-text-link">Bekijk de bewaarstatistiek</Link><button type="button" className="workspace-button" disabled={loading} onClick={() => void refresh()} aria-label="Bewaarstatistiek vernieuwen"><RefreshCw size={14} /></button></div>;
}
