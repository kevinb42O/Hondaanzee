import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Copy, Flag, Loader2, Share2 } from 'lucide-react';
import type { ReportItem } from '../types.ts';
import { fetchVisibleReportByPublicId, flagReport } from '../utils/reportData.ts';
import { formatObservedAbsolute, formatObservedDistance, formatReportShareText, getCategoryMeta, getInterventionBadge } from '../utils/reportHelpers.ts';
import { getReportsPath } from '../utils/reportRoutes.ts';
import { getReportSEO, useSEO } from '../utils/seo.ts';
import NotFound from './NotFound.tsx';

const ReportDetail: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagging, setFlagging] = useState(false);

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
  const interventionBadge = getInterventionBadge(report);
  const shareText = formatReportShareText(report);
  const shareUrl = `${window.location.origin}/meldpunt/${report.public_id}`;

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
        <Link
          to={getReportsPath()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-sky-600 transition hover:text-sky-700"
        >
          <ArrowLeft size={16} />
          Terug naar meldpunt
        </Link>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-950 px-6 py-10 text-white sm:px-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${category.tone} ${category.accent}`}>
                <span aria-hidden="true">{category.emoji}</span>
                {category.label}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-200">
                {report.city_name}
              </span>
              {interventionBadge && (
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-200">
                  {`✅ ${interventionBadge}`}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{report.location_text}</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
              {report.description}
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Gemeld</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatObservedDistance(report.observed_at)}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{formatObservedAbsolute(report.observed_at)}</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Interventiestatus</p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {interventionBadge || 'Nog geen publieke interventie gemarkeerd'}
                </p>
                {report.city_intervention_note && (
                  <p className="mt-1 text-sm font-medium text-slate-500">{report.city_intervention_note}</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium leading-relaxed text-red-900">
              <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-[0.14em]">
                <AlertTriangle size={16} />
                Geen officieel noodkanaal
              </div>
              Voor acute gevaren of dringende interventie contacteer je meteen de lokale hulpdiensten of bevoegde stadsdiensten.
            </div>

            <div className="flex flex-wrap gap-3">
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
