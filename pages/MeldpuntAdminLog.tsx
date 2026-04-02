import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, LogOut, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReportInterventionStatus, ReportItem } from '../types.ts';
import AdminBadge from '../components/admin/AdminBadge.tsx';
import AdminFilterBar from '../components/admin/AdminFilterBar.tsx';
import AdminPageHeader from '../components/admin/AdminPageHeader.tsx';
import AdminReportCard from '../components/admin/AdminReportCard.tsx';
import AdminShell from '../components/admin/AdminShell.tsx';
import AdminStatStrip from '../components/admin/AdminStatStrip.tsx';
import AdminLoginCard from '../components/meldpunt/AdminLoginCard.tsx';
import { fetchAdminReports } from '../utils/reportData.ts';
import { formatObservedAbsolute } from '../utils/reportHelpers.ts';
import { getReportDetailPath, getReportsPath } from '../utils/reportRoutes.ts';
import { useSEO } from '../utils/seo.ts';
import { ADMIN_LOGIN_EMAIL, useAdminAuth } from '../utils/useAdminAuth.ts';

type LogFilter = 'all' | 'removed' | 'hidden' | 'resolved' | 'active';

const interventionTone: Record<ReportInterventionStatus, 'neutral' | 'warning' | 'info' | 'success'> = {
  not_applicable: 'neutral',
  pending: 'warning',
  forwarded: 'info',
  resolved: 'success',
};

const interventionLabels: Record<ReportInterventionStatus, string> = {
  not_applicable: 'Geen update',
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
  const activeCount = reports.filter((report) => report.status !== 'removed').length;

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
            eyebrow="Historiek"
            title="Meldpunt logboek"
            subtitle="Bekijk in één rustig overzicht wat actief, verborgen, opgelost of verwijderd werd."
            sessionEmail={session.user.email || ADMIN_LOGIN_EMAIL}
            actions={(
              <>
                <Link to="/admin" className="admin-btn-secondary">
                  Actieve meldingen
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
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,0.7fr))]">
                  <label className="block xl:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Zoeken</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Locatie, beschrijving, gemeente of public id"
                      className="admin-input"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setLogFilter('all')}
                    className={logFilter === 'all' ? 'admin-btn-primary h-11' : 'admin-btn-secondary h-11'}
                  >
                    Alles
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogFilter('active')}
                    className={logFilter === 'active' ? 'admin-btn-primary h-11' : 'admin-btn-secondary h-11'}
                  >
                    Actief
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogFilter('resolved')}
                    className={logFilter === 'resolved' ? 'admin-btn-primary h-11' : 'admin-btn-secondary h-11'}
                  >
                    Opgelost
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogFilter('hidden')}
                    className={logFilter === 'hidden' ? 'admin-btn-primary h-11' : 'admin-btn-secondary h-11'}
                  >
                    Verborgen
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogFilter('removed')}
                    className={logFilter === 'removed' ? 'admin-btn-primary h-11' : 'admin-btn-secondary h-11'}
                  >
                    Verwijderd
                  </button>
                </div>
              </AdminFilterBar>

              <AdminStatStrip
                items={[
                  { label: 'Resultaten', value: `${filteredReports.length} van ${reports.length}` },
                  { label: 'Actief', value: `${activeCount}` },
                  { label: 'Opgelost', value: `${resolvedCount}` },
                  { label: 'Verborgen', value: `${hiddenCount}` },
                  { label: 'Verwijderd', value: `${removedCount}` },
                ]}
              />

              <div className="grid gap-3">
                {filteredReports.map((report) => (
                  <AdminReportCard
                    key={report.id}
                    report={report}
                    variant="log"
                    metaLine={(
                      <>
                        Aangemaakt {formatObservedAbsolute(report.created_at)} · gezien op {formatObservedAbsolute(report.observed_at)} · public id{' '}
                        <span className="font-semibold text-slate-700">{report.public_id}</span>
                      </>
                    )}
                    badges={(
                      <>
                        <AdminBadge tone="info">{report.city_name}</AdminBadge>
                        <AdminBadge tone={interventionTone[report.city_intervention_status]}>
                          {interventionLabels[report.city_intervention_status]}
                        </AdminBadge>
                        {report.is_hidden ? <AdminBadge tone="warning">Verborgen</AdminBadge> : null}
                        {report.status === 'removed' ? <AdminBadge tone="danger">Verwijderd</AdminBadge> : null}
                      </>
                    )}
                    actions={(
                      <Link to={getReportDetailPath(report.public_id)} className="admin-btn-secondary">
                        Bekijk publiek
                      </Link>
                    )}
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="admin-surface-subtle bg-white px-4 py-4">
                        <p className="admin-eyebrow">Locatie</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{report.location_text}</p>
                      </div>
                      <div className="admin-surface-subtle bg-white px-4 py-4">
                        <p className="admin-eyebrow">Gemeente</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{report.city_name}</p>
                      </div>
                      <div className="admin-surface-subtle bg-white px-4 py-4">
                        <p className="admin-eyebrow">Status</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{interventionLabels[report.city_intervention_status]}</p>
                      </div>
                    </div>

                    {report.city_intervention_note ? (
                      <div className="mt-4 admin-surface-subtle bg-white px-4 py-4">
                        <p className="admin-eyebrow">Publieke terugkoppeling</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{report.city_intervention_note}</p>
                      </div>
                    ) : null}
                  </AdminReportCard>
                ))}

                {!loading && filteredReports.length === 0 && !error ? (
                  <div className="admin-surface px-6 py-12 text-center text-slate-500">
                    Geen logitems gevonden.
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

export default MeldpuntAdminLog;
