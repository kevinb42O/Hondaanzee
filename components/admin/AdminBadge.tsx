import React from 'react';
import type { LucideIcon } from 'lucide-react';

type AdminBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

interface AdminBadgeProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  tone?: AdminBadgeTone;
  compact?: boolean;
}

const toneClasses: Record<AdminBadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  accent: 'border-indigo-200 bg-indigo-50 text-indigo-700',
};

const AdminBadge: React.FC<AdminBadgeProps> = ({ children, icon: Icon, tone = 'neutral', compact = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} ${toneClasses[tone]}`}
  >
    {Icon ? <Icon size={compact ? 12 : 13} /> : null}
    {children}
  </span>
);

export default AdminBadge;
