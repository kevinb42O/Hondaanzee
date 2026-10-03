import React from 'react';
import { NavLink } from 'react-router-dom';

export default function AdminAnalyticsNavigation() {
  return <nav className="workspace-analytics-navigation" aria-label="Analyticsonderdelen">
    <NavLink to="/admin/analytics" end className={({ isActive }) => isActive ? 'is-active' : ''}>Website</NavLink>
    <NavLink to="/admin/analytics/agenda" className={({ isActive }) => isActive ? 'is-active' : ''}>Agenda</NavLink>
  </nav>;
}
