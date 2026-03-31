import React, { useState } from 'react';
import { ArrowRight, Flag, MapPin, Share2, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReportItem } from '../../types.ts';
import {
  formatObservedAbsolute,
  formatObservedDistance,
  formatReportShareText,
  getCategoryMeta,
  getInterventionBadge,
  getInterventionHeadline,
  getInterventionTone,
  getReportLeadVisual,
} from '../../utils/reportHelpers.ts';
import { getReportDetailPath } from '../../utils/reportRoutes.ts';

interface ReportCardProps {
  report: ReportItem;
  onFlag: (publicId: string) => Promise<void>;
  onConfirm: (publicId: string) => Promise<{ alreadyConfirmed: boolean }>;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onFlag, onConfirm }) => {
  const [flagging, setFlagging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const category = getCategoryMeta(report.category);
  const CategoryIcon = category.icon;
  const interventionBadge = getInterventionBadge(report);
  const interventionTone = getInterventionTone(report);
  const leadVisual = getReportLeadVisual(report);
  const LeadIcon = leadVisual.icon;
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
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-28px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 text-white sm:px-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] ${category.tone} ${category.accent}`}>
            <CategoryIcon size={14} />
            {category.label}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-100">
            {report.city_name}
          </span>
          {interventionBadge && (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
              {`✅ ${interventionBadge}`}
            </span>
          )}
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
            bevestigd: {report.confirm_count}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-black tracking-tight text-white sm:text-[2rem]">{report.location_text}</h3>
            <p className="mt-2 text-sm font-medium text-slate-300" title={formatObservedAbsolute(report.observed_at)}>
              {formatObservedDistance(report.observed_at)}
            </p>
          </div>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] border ${leadVisual.tone} shadow-[0_16px_30px_-20px_rgba(15,23,42,0.8)]`}>
            <LeadIcon size={19} strokeWidth={2.3} />
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-7">
        <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-5">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Meldingstekst
          </p>
          <p className="text-base leading-relaxed text-slate-800 sm:text-[17px]">
            {report.description}
          </p>
        </div>

        {(report.city_intervention_status === 'resolved' || report.city_intervention_status === 'forwarded') && (
          <div className={`rounded-[1.4rem] border px-4 py-4 ${interventionTone.panel}`}>
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${interventionTone.accent}`}>
              Publieke update
            </p>
            <p className={`mt-2 text-sm font-black leading-tight ${interventionTone.text}`}>
              {getInterventionHeadline(report)}
            </p>
            {report.city_intervention_note && (
              <p className={`mt-1 text-sm font-medium ${interventionTone.accent}`}>
                {report.city_intervention_note}
              </p>
            )}
          </div>
        )}

        {report.city_intervention_status === 'pending' && (
          <p className="text-sm font-medium text-slate-500">
            Zodra er opvolging is, zie je die hier ook verschijnen.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            disabled={confirming}
            onClick={async () => {
              setConfirming(true);
              try {
                await onConfirm(report.public_id);
              } finally {
                setConfirming(false);
              }
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
          >
            <ThumbsUp size={16} />
            Ik heb dit ook gezien
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-black text-emerald-900">
              {report.confirm_count}
            </span>
          </button>

          <Link
            to={detailPath}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700"
          >
            <MapPin size={16} />
            Bekijk detail
            <ArrowRight size={16} />
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
      </div>
    </article>
  );
};

export default ReportCard;
