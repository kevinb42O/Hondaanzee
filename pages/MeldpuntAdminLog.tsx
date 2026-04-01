import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLoginCard from '../components/meldpunt/AdminLoginCard.tsx';
import type { ReportInterventionStatus, ReportItem } from '../types.ts';
import { fetchAdminReports } from '../utils/reportData.ts';
import { formatObservedAbsolute, getCategoryMeta } from '../utils/reportHelpers.ts';
import { getReportDetailPath, getReportsPath } from '../utils/reportRoutes.ts';
import { useSEO } from '../utils/seo.ts';
import { ADMIN_LOGIN_EMAIL, useAdminAuth } from '../utils/useAdminAuth.ts';

type LogFilter = 'all' | 'removed' | 'hidden' | 'resolved' | 'active';

const interventionLabels: Record<ReportInterventionStatus, string> = {
  not_applicable: 'Niet van toepassing',
  pending: 'Wacht op update',
  forwarded: 'Doorgestuurd',
  resolved: 'Opgelost',
};

const MeldpuntAdminLog: React.FC = () => {
  useSEO({
    title: 'Meldpunt Logboek | HondAanZee.be',
    description: 'Intern logboek met alle meldingen en verwijderde items.',
    canonical: 'https://hondaanzee.be/admin/log',
  });

  const {
    authError,
    authLoading,
    email,
    password,
    session,
    sessionLoading,
    setAuthError,
    setEmail,
    setPassword,
    signIn,
    signOut,
  } = useAdminAuth();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<LogFilter>('all');

  useEffect(() => {
    if (session) {
      return;
    }

    setReports([]);
    setLoading(false);
  }, [session]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextReports = await fetchAdminReports();
      setReports(nextReports);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Kon logboek niet laden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    void loadReports();
  }, [session]);

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...reports]
      .filter((report) => {
        if (query) {
          const haystack = [
            report.location_text,
            report.description,
            report.city_name,
            report.public_id,
            report.city_intervention_note || '',
          ]
            .join(' ')
            .toLowerCase();

          if (!haystack.includes(query)) {
            return false;
          }
        }

        switch (logFilter) {
          case 'removed':
            return report.status === 'removed';
          case 'hidden':
            return report.is_hidden;
          case 'resolved':
            return report.city_intervention_status === 'resolved';
          case 'active':
            return report.status !== 'removed';
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports, searchQuery, logFilter]);

  const removedCount = reports.filter((report) => report.status === 'removed').length;
  const hiddenCount = reports.filter((report) => report.is_hidden).length;
  const resolvedCount = reports.filter((report) => report.city_intervention_status === 'resolved').length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_28%,#e2e8f0_28%,#f8fafc_100%)]">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-24 md:px-6 md:pb-16 md:pt-20">
        <Link
          to={getReportsPath()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-sky-100 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Terug naar meldpunt
        </Link>

        {!session ? (
          <AdminLoginCard
            authLoading={authLoading}
            email={email}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={async () => {
              setError(null);
              await signIn();
            }}
            password={password}
            sessionLoading={sessionLoading}
          />
        ) : (
          <div className="mb-8 overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)]">
            <div className="relative overflow-hidden bg-slate-950 px-6 pb-8 pt-6 text-white sm:px-8">
              <div className="report-grid-pattern absolute inset-0 opacity-20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_26%)]" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  <ShieldCheck size={14} />
                  Admin logboek
                </div>

                <h1 className="text-3xl font-black tracking-tight">Meldpunt logboek</h1>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                  Overzicht van alles wat gebeurde: actieve meldingen, verborgen items, opgeloste cases en verwijderde meldingen.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
                <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Ingelogd</p>
                  <p className="mt-1 text-sm font-bold text-emerald-950">{session.user.email || ADMIN_LOGIN_EMAIL}</p>
                </div>
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  Actieve meldingen
                </Link>
                <button
                  type="button"
                  onClick={() => void loadReports()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  Herlaad logboek
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setAuthError(null);
                    await signOut();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <LogOut size={16} />
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        )}

        {(authError || error) && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {authError || error}
          </div>
        )}

        {session ? (
          loading ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center text-slate-400 shadow-sm">
              <Loader2 className="mx-auto animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Zoeken</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Zoek op locatie, beschrijving, gemeente of public id"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setLogFilter('all')}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${logFilter === 'all' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    Alles
                    <span className="ml-2 opacity-70">{reports.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('removed')}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${logFilter === 'removed' ? 'bg-red-600 text-white' : 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100'}`}
                  >
                    Verwijderd
                    <span className="ml-2 opacity-70">{removedCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('hidden')}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${logFilter === 'hidden' ? 'bg-amber-500 text-white' : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'}`}
                  >
                    Verborgen
                    <span className="ml-2 opacity-70">{hiddenCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('resolved')}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${logFilter === 'resolved' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
                  >
                    Opgelost
                    <span className="ml-2 opacity-70">{resolvedCount}</span>
                  </button>
                </div>
              </div>

              {filteredReports.map((report) => {
                const category = getCategoryMeta(report.category);
                const CategoryIcon = category.icon;

                return (
                  <article key={report.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${category.tone} ${category.accent}`}>
                            <CategoryIcon size={14} />
                            {category.label}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                            {report.city_name}
                          </span>
                          {report.status === 'removed' && (
                            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700">
                              Verwijderd
                            </span>
                          )}
                          {report.is_hidden && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                              Verborgen
                            </span>
                          )}
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            {interventionLabels[report.city_intervention_status]}
                          </span>
                        </div>

                        <h2 className="text-2xl font-black tracking-tight text-slate-950">{report.location_text}</h2>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{report.description}</p>
                      </div>

                      <Link
                        to={getReportDetailPath(report.public_id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                      >
                        Bekijk publiek
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Aangemaakt</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{formatObservedAbsolute(report.created_at)}</p>
                      </div>
                      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Gezien op</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{formatObservedAbsolute(report.observed_at)}</p>
                      </div>
                      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Flags / bevestigingen</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{report.report_count} flags · {report.confirm_count} bevestigingen</p>
                      </div>
                      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Public id</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{report.public_id}</p>
                      </div>
                    </div>

                    {report.city_intervention_note && (
                      <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Publieke terugkoppeling</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{report.city_intervention_note}</p>
                      </div>
                    )}
                  </article>
                );
              })}

              {!loading && filteredReports.length === 0 && !error && (
                <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
                  Geen logitems gevonden.
                </div>
              )}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default MeldpuntAdminLog;
