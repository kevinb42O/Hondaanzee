import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Star, ThumbsUp } from 'lucide-react';
import { useAdminReviewInsights } from '../../utils/useAdminReviewInsights.ts';
import { reviewInsightsPath, reviewPlacePath } from '../../utils/reviewInsights.ts';

export function ReviewCount({ count, error = false, label, stars = false }: { count: number | undefined; error?: boolean; label: string; stars?: boolean }) {
  const Icon = stars ? Star : ThumbsUp;
  return <span className="workspace-review-count" title={error ? 'Cijfers konden niet worden vernieuwd' : `${label}: ${count ?? 'laden'}`}><Icon size={14} aria-hidden="true" />{count === undefined ? error ? '—' : '…' : count.toLocaleString('nl-BE')}{count === undefined && error && <span className="sr-only">Niet beschikbaar</span>}</span>;
}
export default function AdminReviewCounts({ id }: { id: string }) {
  const { data, error, loading, refresh } = useAdminReviewInsights();
  const place = data?.places.find(p => p.place_id === id);
  return <div className="workspace-place-favorites workspace-place-reviews"><div><ReviewCount label="Huidige likes" count={place?.like_count} error={!!error} /><Link to={reviewPlacePath(id)} className="workspace-text-link">{place ? `${place.review_count} reviews` : error ? 'Reviews niet beschikbaar' : 'Reviews laden…'}</Link>{place?.average != null && <span>{place.average.toLocaleString('nl-BE')}/5 · {place.published_count} goedgekeurd</span>}</div><Link to={reviewInsightsPath(id)} className="workspace-text-link">Bekijk likes & reviews</Link><button type="button" className="workspace-button" disabled={loading} onClick={() => void refresh()} aria-label="Likes en reviews vernieuwen"><RefreshCw size={14} /></button>{error && <small role="status">{data ? 'Vernieuwen mislukt; dit zijn de vorige cijfers.' : 'Cijfers konden niet worden geladen.'}</small>}</div>;
}
