import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, EyeOff, Loader2, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReportInterventionStatus, ReportItem } from '../types.ts';
import { fetchAdminReports, updateAdminReportStatus } from '../utils/reportData.ts';
import { formatObservedAbsolute, getCategoryMeta } from '../utils/reportHelpers.ts';
import { getReportDetailPath, getReportsPath } from '../utils/reportRoutes.ts';
import { useSEO } from '../utils/seo.ts';

const ADMIN_STORAGE_KEY = 'meldpunt-admin-key';

const interventionOptions: Array<{ value: ReportInterventionStatus; label: string }> = [
  { value: 'not_applicable', label: 'Niet van toepassing' },
  { value: 'pending', label: 'Pending' },
  { value: 'forwarded', label: 'Doorgestuurd' },
  { value: 'resolved', label: 'Resolved' },
];

const MeldpuntAdmin: React.FC = () => {
  useSEO({
    title: 'Meldpunt Admin | HondAanZee.be',
    description: 'Interne adminpagina voor interventiestatus van meldingen.',
    canonical: 'https://hondaanzee.be/_meldpunt-admin',
  });

  const [adminKey, setAdminKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusEdits, setStatusEdits] = useState<Record<string, ReportInterventionStatus>>({});
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [savingPublicId, setSavingPublicId] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = window.localStorage.getItem(ADMIN_STORAGE_KEY) || '';
    if (!storedKey) {
      return;
    }

    setAdminKey(storedKey);
    setSavedKey(storedKey);
  }, []);

  const loadReports = async (keyToUse: string) => {
    setLoading(true);
    setError(null);

    try {
      const nextReports = await fetchAdminReports(keyToUse);
      setReports(nextReports);
      setStatusEdits(
        Object.fromEntries(nextReports.map((report) => [report.public_id, report.city_intervention_status])),
      );
      setNoteEdits(
        Object.fromEntries(nextReports.map((report) => [report.public_id, report.city_intervention_note || ''])),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Kon adminmeldingen niet laden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!savedKey) {
      return;
    }

    void loadReports(savedKey);
  }, [savedKey]);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [reports],
  );

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <Link
          to={getReportsPath()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-sky-600 transition hover:text-sky-700"
        >
          <ArrowLeft size={16} />
          Terug naar meldpunt
        </Link>

        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
            <ShieldCheck size={14} />
            Verborgen adminflow
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">Meldpunt admin</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Hier kan je zonder Supabase-tabellen interventiestatus en notities per melding aanpassen.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Admin-sleutel"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem(ADMIN_STORAGE_KEY, adminKey);
                setSavedKey(adminKey);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 font-black text-white transition hover:bg-sky-700"
            >
              <ShieldCheck size={16} />
              Open admin
            </button>
            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem(ADMIN_STORAGE_KEY);
                setSavedKey('');
                setAdminKey('');
                setReports([]);
                setError(null);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <EyeOff size={16} />
              Reset sleutel
            </button>
          </div>

          {savedKey && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void loadReports(savedKey)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <RefreshCw size={16} />
                Herlaad meldingen
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center text-slate-400 shadow-sm">
            <Loader2 className="mx-auto animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedReports.map((report) => {
              const category = getCategoryMeta(report.category);
              const currentStatus = statusEdits[report.public_id] || report.city_intervention_status;
              const currentNote = noteEdits[report.public_id] || '';

              return (
                <article key={report.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${category.tone} ${category.accent}`}>
                      <span aria-hidden="true">{category.emoji}</span>
                      {category.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                      {report.city_name}
                    </span>
                    {report.is_hidden && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                        Verborgen
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                      flags: {report.report_count}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{report.location_text}</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {formatObservedAbsolute(report.observed_at)} · public id: <span className="font-bold">{report.public_id}</span>
                      </p>
                    </div>
                    <Link
                      to={getReportDetailPath(report.public_id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                      Bekijk publiek
                    </Link>
                  </div>

                  <p className="mb-5 text-sm leading-relaxed text-slate-700 sm:text-base">{report.description}</p>

                  <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Interventiestatus</span>
                      <select
                        value={currentStatus}
                        onChange={(event) =>
                          setStatusEdits((current) => ({
                            ...current,
                            [report.public_id]: event.target.value as ReportInterventionStatus,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                      >
                        {interventionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Notitie voor intern/publiek label</span>
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(event) =>
                          setNoteEdits((current) => ({
                            ...current,
                            [report.public_id]: event.target.value,
                          }))
                        }
                        maxLength={300}
                        placeholder="Bijv. Opgeruimd door stadsdiensten op 31 maart 2026."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={savingPublicId === report.public_id || !savedKey}
                      onClick={async () => {
                        setSavingPublicId(report.public_id);
                        setError(null);

                        try {
                          await updateAdminReportStatus(
                            savedKey,
                            report.public_id,
                            currentStatus,
                            currentNote,
                          );
                          await loadReports(savedKey);
                        } catch (saveError) {
                          setError(saveError instanceof Error ? saveError.message : 'Kon status niet opslaan.');
                        } finally {
                          setSavingPublicId(null);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingPublicId === report.public_id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Opslaan
                    </button>
                  </div>
                </article>
              );
            })}

            {!loading && sortedReports.length === 0 && savedKey && !error && (
              <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
                Geen meldingen gevonden.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeldpuntAdmin;
