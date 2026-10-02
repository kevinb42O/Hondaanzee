import React from 'react';
import { Link } from 'react-router-dom';
import { reviewInsightsPath } from '../../utils/reviewInsights.ts';
export default function AdminReviewNavigation({ insights = false }: { insights?: boolean }) {
  return <nav className="workspace-review-navigation" aria-label="Likes en reviews"><Link to={reviewInsightsPath()} className={insights ? 'is-active' : ''} aria-current={insights ? 'page' : undefined}>Likes & reviews</Link><Link to="/admin/reviews" className={!insights ? 'is-active' : ''} aria-current={!insights ? 'page' : undefined}>Reviews beoordelen</Link></nav>;
}
