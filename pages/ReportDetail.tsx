import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Copy, Flag, Loader2, Share2, ThumbsUp } from 'lucide-react';
import type { ReportItem } from '../types.ts';
import { confirmReport, fetchVisibleReportByPublicId, flagReport } from '../utils/reportData.ts';
import {
  formatObservedAbsolute,
  formatObservedDistance,
  formatReportShareText,
  getCategoryMeta,
  getInterventionBadge,
  getInterventionHeadline,
  getInterventionTone,
  getReportLeadVisual,
} from '../utils/reportHelpers.ts';
import { getReportsPath } from '../utils/reportRoutes.ts';
import { getReportSEO, useSEO } from '../utils/seo.ts';
import NotFound from './NotFound.tsx';

const ReportDetail: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagging, setFlagging] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useSEO(report ? getReportSEO(report) : {
    title: 'Melding laden | HondAanZee.be',
    description: 'Detailpagina voor een melding in het Meldpunt Gif & Overlast.',
    canonical: publicId ? `https://hondaanzee.be/meldpunt/${publicId}` : 'https://hondaanzee.be/meldpunt',
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!publicId) {
      setLoading(false);
      return;
    }

    const loadReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchVisibleReportByPublicId(publicId);
        setReport(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Kon de melding niet laden.');
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [publicId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-8 text-sm font-bold text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return <NotFound />;
  }

  const category = getCategoryMeta(report.category);
  const CategoryIcon = category.icon;
  const interventionBadge = getInterventionBadge(report);
  const interventionHeadline = getInterventionHeadline(report);
  const interventionTone = getInterventionTone(report);
  const leadVisual = getReportLeadVisual(report);
  const LeadIcon = leadVisual.icon;
  const shareText = formatReportShareText(report);
  const shareUrl = `${window.location.origin}/meldpunt/${report.public_id}`;

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 md:px-6 md:pb-20 md:pt-20">
        <Link
          to={getReportsPath()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-sky-600 transition hover:text-sky-700"
        >
          <ArrowLeft size={16} />
          Terug naar meldpunt
        </Link>

        <article className="overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)]">
          <div className="relative overflow-hidden border-b border-slate-100 bg-slate-950 px-6 py-10 text-white sm:px-8 sm:py-12">
            <div className="report-grid-pattern absolute inset-0 opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%)]" />
            <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] ${category.tone} ${category.accent}`}>
                <CategoryIcon size={14} />
                {category.label}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-200">
                {report.city_name}
              </span>
              {interventionBadge && (
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
                  {`✅ ${interventionBadge}`}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{report.location_text}</h1>
                <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-300 sm:text-xl">
                  {report.description}
                </p>
              </div>
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] border ${leadVisual.tone} shadow-[0_20px_44px_-24px_rgba(15,23,42,0.9)] sm:h-24 sm:w-24`}>
                <LeadIcon size={34} strokeWidth={2.1} />
              </div>
            </div>
            </div>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-8 md:px-10 md:py-10">
            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Beschrijving van de melding</p>
                <p className="mt-4 text-lg leading-relaxed text-slate-800 sm:text-xl">
                  {report.description}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                  <ThumbsUp size={15} />
                  {report.confirm_count} {report.confirm_count === 1 ? 'bevestiging' : 'bevestigingen'}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Gemeld</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-[2rem]">{formatObservedDistance(report.observed_at)}</p>
                <p className="mt-2 text-base font-medium text-slate-500">{formatObservedAbsolute(report.observed_at)}</p>
                </div>

                {(report.city_intervention_status === 'resolved' || report.city_intervention_status === 'forwarded') ? (
                  <div className={`rounded-[2rem] border p-6 ${interventionTone.panel}`}>
                    <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${interventionTone.accent}`}>Update</p>
                    <p className={`mt-4 text-xl font-black leading-tight ${interventionTone.text}`}>
                      {interventionHeadline}
                    </p>
                    {report.city_intervention_note && (
                      <p className={`mt-2 text-base font-medium ${interventionTone.accent}`}>
                        {report.city_intervention_note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Update</p>
                    <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
                      Er is nog geen update toegevoegd aan deze melding.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-red-100 bg-red-50 px-5 py-5 text-base font-medium leading-relaxed text-red-900">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
                <AlertTriangle size={16} />
                Geen officieel noodkanaal
              </div>
              Voor acute gevaren of dringende interventie contacteer je meteen de lokale hulpdiensten of bevoegde stadsdiensten.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={confirming}
                onClick={async () => {
                  setConfirming(true);
                  try {
                    const result = await confirmReport(report.public_id);
                    setReport((current) =>
                      current
                        ? { ...current, confirm_count: result.confirm_count }
                        : current,
                    );
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

              <button
                type="button"
                onClick={async () => {
                  if (navigator.share) {
                    await navigator.share({
                      title: shareText,
                      text: shareText,
                      url: shareUrl,
                    });
                    return;
                  }

                  await navigator.clipboard.writeText(shareUrl);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700"
              >
                <Share2 size={16} />
                Deel melding
              </button>

              <button
                type="button"
                onClick={async () => navigator.clipboard.writeText(shareUrl)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <Copy size={16} />
                Kopieer link
              </button>

              <button
                type="button"
                disabled={flagging}
                onClick={async () => {
                  setFlagging(true);
                  try {
                    const result = await flagReport(report.public_id);
                    if (result.is_hidden) {
                      setReport(null);
                      return;
                    }
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
      </div>
    </div>
  );
};

export default ReportDetail;
