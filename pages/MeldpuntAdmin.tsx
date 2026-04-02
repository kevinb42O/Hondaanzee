import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, LogOut, RefreshCw, Save, Trash2, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReportInterventionStatus, ReportItem } from '../types.ts';
import AdminBadge from '../components/admin/AdminBadge.tsx';
import AdminFilterBar from '../components/admin/AdminFilterBar.tsx';
import AdminPageHeader from '../components/admin/AdminPageHeader.tsx';
import AdminReportCard from '../components/admin/AdminReportCard.tsx';
import AdminShell from '../components/admin/AdminShell.tsx';
import AdminStatStrip from '../components/admin/AdminStatStrip.tsx';
import AdminLoginCard from '../components/meldpunt/AdminLoginCard.tsx';
import { fetchAdminReports, removeAdminReport, updateAdminReportStatus } from '../utils/reportData.ts';
import { formatObservedAbsolute, getCategoryMeta } from '../utils/reportHelpers.ts';
import { getReportDetailPath, getReportsPath } from '../utils/reportRoutes.ts';
import { useSEO } from '../utils/seo.ts';
import { ADMIN_LOGIN_EMAIL, useAdminAuth } from '../utils/useAdminAuth.ts';

const interventionOptions: Array<{ value: ReportInterventionStatus; label: string }> = [
  { value: 'not_applicable', label: 'Niet van toepassing' },
  { value: 'pending', label: 'Wacht op update' },
  { value: 'forwarded', label: 'Doorgestuurd' },
  { value: 'resolved', label: 'Opgeruimd / opgelost' },
];

const interventionTone: Record<ReportInterventionStatus, 'neutral' | 'warning' | 'info' | 'success'> = {
  not_applicable: 'neutral',
  pending: 'warning',
  forwarded: 'info',
  resolved: 'success',
};

const interventionLabel: Record<ReportInterventionStatus, string> = {
  not_applicable: 'Geen update',
  pending: 'Wacht op update',
  forwarded: 'Doorgestuurd',
  resolved: 'Opgelost',
};

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

type VisibilityFilter = 'all' | 'visible' | 'hidden';

const MeldpuntAdmin: React.FC = () => {
  useSEO({
    title: 'Meldpunt Admin | HondAanZee.be',
    description: 'Interne adminpagina voor interventiestatus van meldingen.',
    canonical: 'https://hondaanzee.be/admin',
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
  const [statusEdits, setStatusEdits] = useState<Record<string, ReportInterventionStatus>>({});
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ReportItem['category']>('all');
  const [interventionFilter, setInterventionFilter] = useState<'all' | ReportInterventionStatus>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [savingPublicId, setSavingPublicId] = useState<string | null>(null);
  const [removingPublicId, setRemovingPublicId] = useState<string | null>(null);
  const noteRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    if (session) {
      return;
    }

    setReports([]);
    setStatusEdits({});
    setNoteEdits({});
    setExpandedReports({});
    setSavingPublicId(null);
    setRemovingPublicId(null);
    setLoading(false);
  }, [session]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextReports = await fetchAdminReports();
      setReports(nextReports);
      setStatusEdits(
        Object.fromEntries(nextReports.map((report) => [report.public_id, report.city_intervention_status])),
      );
      setNoteEdits(
        Object.fromEntries(nextReports.map((report) => [report.public_id, report.city_intervention_note || ''])),
      );
      setExpandedReports((current) =>
        Object.fromEntries(nextReports.map((report) => [report.public_id, current[report.public_id] || false])),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Kon adminmeldingen niet laden.');
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

  const activeReports = useMemo(
    () => reports.filter((report) => report.status !== 'removed'),
    [reports],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(activeReports.map((report) => report.category))),
    [activeReports],
  );

  const cityOptions = useMemo(
    () => Array.from(new Set(activeReports.map((report) => report.city_name))).sort((a, b) => a.localeCompare(b, 'nl')),
    [activeReports],
  );

  const filteredReports = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...activeReports]
      .filter((report) => {
        if (normalizedQuery) {
          const haystack = [
            report.location_text,
            report.description,
            report.city_name,
            report.public_id,
            report.city_intervention_note || '',
          ]
            .join(' ')
            .toLowerCase();

          if (!haystack.includes(normalizedQuery)) {
            return false;
          }
        }

        if (cityFilter !== 'all' && report.city_name !== cityFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && report.category !== categoryFilter) {
          return false;
        }

        if (interventionFilter !== 'all' && report.city_intervention_status !== interventionFilter) {
          return false;
        }

        if (visibilityFilter === 'visible' && report.is_hidden) {
          return false;
        }

        if (visibilityFilter === 'hidden' && !report.is_hidden) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activeReports, searchQuery, cityFilter, categoryFilter, interventionFilter, visibilityFilter]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || cityFilter !== 'all' || categoryFilter !== 'all' || interventionFilter !== 'all' || visibilityFilter !== 'all',
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

  const toggleReport = (publicId: string) => {
    setExpandedReports((current) => ({
      ...current,
      [publicId]: !current[publicId],
    }));
  };

  const setAllExpanded = (expanded: boolean) => {
    setExpandedReports(Object.fromEntries(filteredReports.map((report) => [report.public_id, expanded])));
  };

  return (
    <AdminShell backHref={getReportsPath()} backLabel="Terug naar meldpunt">
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
        <div className="grid gap-4">
          <AdminPageHeader
            eyebrow="Actieve meldingen"
            title="Meldpunt admin"
            subtitle="Werk vanuit een rustige queue: filter, scan en werk meldingen af zonder visuele ruis."
            sessionEmail={session.user.email || ADMIN_LOGIN_EMAIL}
            actions={(
              <>
                <Link to="/admin/log" className="admin-btn-secondary">
                  Logboek
                </Link>
                <button type="button" onClick={() => void loadReports()} className="admin-btn-secondary">
                  <RefreshCw size={16} />
                  Herlaad
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setAuthError(null);
                    await signOut();
                  }}
                  className="admin-btn-secondary"
                >
                  <LogOut size={16} />
                  Uitloggen
                </button>
              </>
            )}
          />

          {(authError || error) ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {authError || error}
            </div>
          ) : null}

          {loading ? (
            <div className="admin-surface px-6 py-16 text-center text-slate-400">
              <Loader2 className="mx-auto animate-spin" />
            </div>
          ) : (
            <>
              <AdminFilterBar>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(4,minmax(0,0.8fr))]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Zoeken</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Locatie, beschrijving, gemeente of public id"
                      className="admin-input"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Gemeente</span>
                    <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="admin-input">
                      <option value="all">Alle gemeenten</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Categorie</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value as 'all' | ReportItem['category'])}
                      className="admin-input"
                    >
                      <option value="all">Alle categorieën</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {getCategoryMeta(category).label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Opvolgstatus</span>
                    <select
                      value={interventionFilter}
                      onChange={(event) => setInterventionFilter(event.target.value as 'all' | ReportInterventionStatus)}
                      className="admin-input"
                    >
                      <option value="all">Alle statussen</option>
                      {interventionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Zichtbaarheid</span>
                    <select
                      value={visibilityFilter}
                      onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
                      className="admin-input"
                    >
                      <option value="all">Alles</option>
                      <option value="visible">Publiek zichtbaar</option>
                      <option value="hidden">Verborgen</option>
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setAllExpanded(true)} className="admin-btn-subtle">
                    <ChevronDown size={16} />
                    Alles open
                  </button>
                  <button type="button" onClick={() => setAllExpanded(false)} className="admin-btn-subtle">
                    <ChevronUp size={16} />
                    Alles dicht
                  </button>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCityFilter('all');
                        setCategoryFilter('all');
                        setInterventionFilter('all');
                        setVisibilityFilter('all');
                      }}
                      className="admin-btn-subtle"
                    >
                      Reset filters
                    </button>
                  ) : null}
                </div>
              </AdminFilterBar>

              <AdminStatStrip
                items={[
                  { label: 'Resultaten', value: `${filteredReports.length} van ${activeReports.length}` },
                  { label: 'Verborgen', value: `${activeReports.filter((report) => report.is_hidden).length}` },
                  { label: 'Opgelost', value: `${activeReports.filter((report) => report.city_intervention_status === 'resolved').length}` },
                  { label: 'In logboek', value: `${reports.length - activeReports.length}` },
                ]}
              />

              <div className="grid gap-3">
                {filteredReports.map((report) => {
                  const currentStatus = statusEdits[report.public_id] || report.city_intervention_status;
                  const currentNote = noteEdits[report.public_id] || '';
                  const isExpanded = expandedReports[report.public_id] || false;

                  return (
                    <AdminReportCard
                      key={report.id}
                      report={report}
                      variant="active"
                      isExpanded={isExpanded}
                      onToggle={() => toggleReport(report.public_id)}
                      badges={(
                        <>
                          <AdminBadge tone="info">{report.city_name}</AdminBadge>
                          <AdminBadge tone={interventionTone[report.city_intervention_status]}>
                            {interventionLabel[report.city_intervention_status]}
                          </AdminBadge>
                          {report.is_hidden ? <AdminBadge tone="warning">Verborgen</AdminBadge> : null}
                        </>
                      )}
                      summary={(
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-sm leading-6 text-slate-600">
                            {report.description.slice(0, 180)}
                            {report.description.length > 180 ? '…' : ''}
                          </p>
                        </div>
                      )}
                    >
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <section className="admin-surface-subtle bg-white px-4 py-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="admin-eyebrow">Publieke melding</p>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{report.description}</p>
                            </div>
                            <Link to={getReportDetailPath(report.public_id)} className="admin-btn-secondary">
                              Bekijk publiek
                            </Link>
                          </div>
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                          <div className="admin-surface-subtle bg-white px-4 py-4">
                            <p className="admin-eyebrow">Gezien op</p>
                            <p className="mt-2 text-sm font-bold text-slate-900">{formatObservedAbsolute(report.observed_at)}</p>
                          </div>
                          <div className="admin-surface-subtle bg-white px-4 py-4">
                            <p className="admin-eyebrow">Public id</p>
                            <p className="mt-2 text-sm font-bold text-slate-900">{report.public_id}</p>
                          </div>
                        </section>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_auto] xl:items-start">
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
                            className="admin-input"
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
                            <span className="text-sm font-bold text-slate-700">Publieke terugkoppeling</span>
                            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                              <Wand2 size={12} />
                              Snelle invoer
                            </div>
                          </div>

                          <div className="mb-3 flex flex-wrap gap-2">
                            {noteQuickIcons.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => insertIntoNote(report.public_id, item.value)}
                                className="admin-btn-subtle px-3 py-1.5 text-xs"
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
                                className="admin-btn-subtle px-3 py-1.5 text-xs"
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
                            rows={5}
                            placeholder="Bijv. ✅ Opgeruimd door stadsdiensten op 31 maart 2026."
                            className="admin-textarea"
                          />
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                            <span>Deze tekst kan zichtbaar worden op de publieke meldingspagina.</span>
                            <span>{currentNote.length}/300</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            disabled={savingPublicId === report.public_id || !session}
                            onClick={async () => {
                              setSavingPublicId(report.public_id);
                              setError(null);

                              try {
                                await updateAdminReportStatus(report.public_id, currentStatus, currentNote);
                                await loadReports();
                              } catch (saveError) {
                                setError(saveError instanceof Error ? saveError.message : 'Kon status niet opslaan.');
                              } finally {
                                setSavingPublicId(null);
                              }
                            }}
                            className="admin-btn-primary"
                          >
                            {savingPublicId === report.public_id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Opslaan
                          </button>

                          <button
                            type="button"
                            disabled={removingPublicId === report.public_id || !session || report.status === 'removed'}
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
                                await removeAdminReport(report.public_id);
                                await loadReports();
                              } catch (removeError) {
                                setError(removeError instanceof Error ? removeError.message : 'Kon melding niet verwijderen.');
                              } finally {
                                setRemovingPublicId(null);
                              }
                            }}
                            className="admin-btn-danger"
                          >
                            {removingPublicId === report.public_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Verwijder
                          </button>
                        </div>
                      </div>
                    </AdminReportCard>
                  );
                })}

                {!loading && filteredReports.length === 0 && !error ? (
                  <div className="admin-surface px-6 py-12 text-center text-slate-500">
                    Geen meldingen gevonden.
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}
    </AdminShell>
  );
};

export default MeldpuntAdmin;
