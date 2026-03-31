import React, { useState } from 'react';
import { AlertTriangle, Flag, MapPin, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReportItem } from '../../types.ts';
import { formatObservedAbsolute, formatObservedDistance, formatReportShareText, getCategoryMeta, getInterventionBadge } from '../../utils/reportHelpers.ts';
import { getReportDetailPath } from '../../utils/reportRoutes.ts';

interface ReportCardProps {
  report: ReportItem;
  onFlag: (publicId: string) => Promise<void>;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onFlag }) => {
  const [flagging, setFlagging] = useState(false);
  const category = getCategoryMeta(report.category);
  const interventionBadge = getInterventionBadge(report);
  const detailPath = getReportDetailPath(report.public_id);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${detailPath}`;
    const text = formatReportShareText(report);

    if (navigator.share) {
      await navigator.share({
        title: text,
        text,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${category.tone} ${category.accent}`}>
          <span aria-hidden="true">{category.emoji}</span>
          {category.label}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
          {report.city_name}
        </span>
        {interventionBadge && (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            {`✅ ${interventionBadge}`}
          </span>
        )}
      </div>

      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">{report.location_text}</h3>
          <p className="mt-1 text-sm font-medium text-slate-500" title={formatObservedAbsolute(report.observed_at)}>
            {formatObservedDistance(report.observed_at)}
          </p>
        </div>
        <AlertTriangle size={18} className={report.category === 'gif' ? 'text-red-500' : 'text-slate-300'} />
      </div>

      <p className="mb-5 text-sm leading-relaxed text-slate-700 sm:text-base">
        {report.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          to={detailPath}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700"
        >
          <MapPin size={16} />
          Bekijk detail
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
        >
          <Share2 size={16} />
          Deel melding
        </button>

        <button
          type="button"
          disabled={flagging}
          onClick={async () => {
            setFlagging(true);
            try {
              await onFlag(report.public_id);
            } finally {
              setFlagging(false);
            }
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
        >
          <Flag size={16} />
          Meld ongepaste inhoud
        </button>
      </div>
    </article>
  );
};

export default ReportCard;
