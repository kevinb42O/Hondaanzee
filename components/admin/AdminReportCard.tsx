import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReportItem } from '../../types.ts';
import { formatObservedAbsolute, getCategoryMeta, getReportLeadVisual } from '../../utils/reportHelpers.ts';
import AdminBadge from './AdminBadge.tsx';

interface AdminReportCardProps {
  report: ReportItem;
  variant?: 'active' | 'log';
  isExpanded?: boolean;
  onToggle?: () => void;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  metaLine?: React.ReactNode;
  summary?: React.ReactNode;
  children?: React.ReactNode;
}

const AdminReportCard: React.FC<AdminReportCardProps> = ({
  report,
  variant = 'active',
  isExpanded = false,
  onToggle,
  badges,
  actions,
  metaLine,
  summary,
  children,
}) => {
  const category = getCategoryMeta(report.category);
  const CategoryIcon = category.icon;
  const leadVisual = getReportLeadVisual(report);
  const LeadIcon = leadVisual.icon;
  const showBody = variant === 'log' || isExpanded;

  return (
    <article className={`admin-surface overflow-hidden ${variant === 'log' ? 'shadow-[0_10px_24px_-20px_rgba(15,23,42,0.2)]' : ''}`}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <AdminBadge tone="neutral" icon={CategoryIcon}>
                {category.label}
              </AdminBadge>
              {badges}
            </div>

            <div className="flex items-start gap-3">
              <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:flex ${variant === 'log' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <LeadIcon size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{report.location_text}</h2>
                {showBody || variant === 'log' ? (
                  <p className="mt-1 text-sm leading-6 text-slate-600">{report.description}</p>
                ) : null}
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {metaLine ?? (
                    <>
                      {formatObservedAbsolute(report.observed_at)} · public id <span className="font-semibold text-slate-700">{report.public_id}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[245px] lg:items-end">
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <AdminBadge compact>{report.report_count} flags</AdminBadge>
              <AdminBadge compact tone="info">{report.confirm_count} bevestigingen</AdminBadge>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {actions}
              {onToggle ? (
                <button type="button" onClick={onToggle} className="admin-btn-secondary">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isExpanded ? 'Dicht' : 'Open'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {!showBody && summary ? <div className="mt-4">{summary}</div> : null}
      </div>

      {showBody ? <div className="border-t border-slate-200 bg-slate-50/55 p-4 sm:p-5">{children}</div> : null}
    </article>
  );
};

export default AdminReportCard;
