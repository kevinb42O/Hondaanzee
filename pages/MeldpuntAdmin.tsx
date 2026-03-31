import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, EyeOff, Loader2, RefreshCw, Save, ShieldCheck, Trash2, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReportInterventionStatus, ReportItem } from '../types.ts';
import { fetchAdminReports, removeAdminReport, updateAdminReportStatus } from '../utils/reportData.ts';
import { formatObservedAbsolute, getCategoryMeta, getReportLeadVisual } from '../utils/reportHelpers.ts';
import { getReportDetailPath, getReportsPath } from '../utils/reportRoutes.ts';
import { useSEO } from '../utils/seo.ts';

const ADMIN_STORAGE_KEY = 'meldpunt-admin-key';

const interventionOptions: Array<{ value: ReportInterventionStatus; label: string }> = [
  { value: 'not_applicable', label: 'Niet van toepassing' },
  { value: 'pending', label: 'Wacht op update' },
  { value: 'forwarded', label: 'Doorgestuurd' },
  { value: 'resolved', label: 'Opgeruimd / opgelost' },
];

const noteQuickIcons = [
  { label: 'Check', value: '✅ ' },
  { label: 'Waarschuwing', value: '⚠️ ' },
  { label: 'Locatie', value: '📍 ' },
  { label: 'Gif', value: '☠️ ' },
  { label: 'Afval', value: '🗑️ ' },
  { label: 'Voorwerp', value: '📦 ' },
  { label: 'Hond', value: '🐾 ' },
];

const noteQuickPhrases = [
  'Melding ontvangen door bevoegde dienst.',
  'Doorgestuurd naar stadsdiensten.',
  'Ter plaatse nagekeken.',
  'Opgeruimd door stadsdiensten.',
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
  const [removingPublicId, setRemovingPublicId] = useState<string | null>(null);
  const noteRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

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

  const insertIntoNote = (publicId: string, insertion: string) => {
    const textarea = noteRefs.current[publicId];

    if (!textarea) {
      setNoteEdits((current) => ({
        ...current,
        [publicId]: `${current[publicId] || ''}${insertion}`.trimStart(),
      }));
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const currentValue = noteEdits[publicId] || '';
    const nextValue = `${currentValue.slice(0, start)}${insertion}${currentValue.slice(end)}`;

    setNoteEdits((current) => ({
      ...current,
      [publicId]: nextValue,
    }));

    window.requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + insertion.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-24 md:px-6 md:pb-16 md:pt-20">
        <Link
          to={getReportsPath()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-sky-600 transition hover:text-sky-700"
        >
          <ArrowLeft size={16} />
          Terug naar meldpunt
        </Link>

        <div className="mb-8 overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)]">
          <div className="relative overflow-hidden bg-slate-950 px-6 pb-8 pt-6 text-white sm:px-8">
            <div className="report-grid-pattern absolute inset-0 opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_26%)]" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                <ShieldCheck size={14} />
                Verborgen adminflow
              </div>

              <h1 className="text-3xl font-black tracking-tight">Meldpunt admin</h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                Beheerpaneel voor bevoegde instanties. Hier kan je meldingen nakijken, de opvolgstatus vastleggen en een duidelijke publieke terugkoppeling publiceren.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
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
              const CategoryIcon = category.icon;
              const leadVisual = getReportLeadVisual(report);
              const LeadIcon = leadVisual.icon;
              const currentStatus = statusEdits[report.public_id] || report.city_intervention_status;
              const currentNote = noteEdits[report.public_id] || '';

              return (
                <article key={report.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
                  <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${category.tone} ${category.accent}`}>
                        <CategoryIcon size={14} />
                        {category.label}
                      </span>
                      <span className="rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-sky-100">
                        Gemeente: {report.city_name}
                      </span>
                      {report.is_hidden && (
                        <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-200">
                          Verborgen
                        </span>
                      )}
                      {report.status === 'removed' && (
                        <span className="rounded-full border border-red-300/30 bg-red-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-200">
                          Verwijderd uit publieke site
                        </span>
                      )}
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                        flags: {report.report_count}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                        bevestigingen: {report.confirm_count}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-white sm:text-2xl">{report.location_text}</h2>
                        <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-sky-200">
                          Bevoegde gemeente: {report.city_name}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-300">
                          {formatObservedAbsolute(report.observed_at)} · public id: <span className="font-bold">{report.public_id}</span>
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] border ${leadVisual.tone}`}>
                        <LeadIcon size={20} strokeWidth={2.2} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 px-6 py-6">
                    <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-5">
                      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Melding zoals bezoekers ze zien</p>
                      <p className="text-base leading-relaxed text-slate-800">{report.description}</p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                        {report.confirm_count} {report.confirm_count === 1 ? 'persoon bevestigt deze melding' : 'personen bevestigen deze melding'}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-600">
                        Kies hieronder de officiële status en voeg indien nodig een korte publieke terugkoppeling toe.
                      </p>
                      <Link
                        to={getReportDetailPath(report.public_id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                      >
                        Bekijk publiek
                      </Link>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-start">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Officiële opvolgstatus</span>
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

                    <div className="block">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="block text-sm font-bold text-slate-700">Publieke terugkoppeling</span>
                        <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          <Wand2 size={12} />
                          1 klik
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {noteQuickIcons.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => insertIntoNote(report.public_id, item.value)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                          >
                            {item.value.trim()} {item.label}
                          </button>
                        ))}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {noteQuickPhrases.map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => insertIntoNote(report.public_id, `${currentNote.trim() ? ' ' : ''}${phrase}`)}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {phrase}
                          </button>
                        ))}
                      </div>

                      <textarea
                        ref={(element) => {
                          noteRefs.current[report.public_id] = element;
                        }}
                        value={currentNote}
                        onChange={(event) =>
                          setNoteEdits((current) => ({
                            ...current,
                            [report.public_id]: event.target.value,
                          }))
                        }
                        maxLength={300}
                        rows={4}
                        placeholder="Bijv. ✅ Opgeruimd door stadsdiensten op 31 maart 2026."
                        className="w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                      />
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                        <span>Deze tekst kan zichtbaar worden op de publieke meldingspagina.</span>
                        <span>{currentNote.length}/300</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
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

                      <button
                        type="button"
                        disabled={removingPublicId === report.public_id || !savedKey || report.status === 'removed'}
                        onClick={async () => {
                          const confirmed = window.confirm(
                            `Deze melding wordt verwijderd uit de publieke site voor ${report.city_name}. Verdergaan?`,
                          );

                          if (!confirmed) {
                            return;
                          }

                          setRemovingPublicId(report.public_id);
                          setError(null);

                          try {
                            await removeAdminReport(savedKey, report.public_id);
                            await loadReports(savedKey);
                          } catch (removeError) {
                            setError(removeError instanceof Error ? removeError.message : 'Kon melding niet verwijderen.');
                          } finally {
                            setRemovingPublicId(null);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-black text-red-800 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removingPublicId === report.public_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Verwijder melding
                      </button>
                    </div>
                    </div>
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
