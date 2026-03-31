import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, Plus, ShieldAlert } from 'lucide-react';
import ReportFeed from '../components/meldpunt/ReportFeed.tsx';
import ReportFilters from '../components/meldpunt/ReportFilters.tsx';
import ReportFormModal from '../components/meldpunt/ReportFormModal.tsx';
import type { ReportFilters as ReportFiltersValue, ReportItem } from '../types.ts';
import { fetchVisibleReports, flagReport } from '../utils/reportData.ts';
import { SEO_DATA, useSEO } from '../utils/seo.ts';

const initialFilters: ReportFiltersValue = {
  city: 'all',
  category: 'all',
};

const Meldpunt: React.FC = () => {
  useSEO(SEO_DATA.meldpunt);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [filters, setFilters] = useState<ReportFiltersValue>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdDetailPath, setCreatedDetailPath] = useState<string | null>(null);
  const [flagMessage, setFlagMessage] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchVisibleReports();
      setReports(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Kon meldingen niet laden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    void loadReports();
  }, []);

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const cityMatches = filters.city === 'all' || report.city_slug === filters.city;
        const categoryMatches = filters.category === 'all' || report.category === filters.category;
        return cityMatches && categoryMatches;
      }),
    [filters, reports],
  );

  return (
    <div className="animate-in fade-in overflow-x-hidden bg-slate-50">
      <section data-header-hero="light" className="relative flex min-h-[50vh] items-center overflow-hidden pb-24 pt-12 text-white sm:pt-16 md:pb-36 md:pt-24">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/properstrand.webp)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 py-2 text-sm font-bold text-sky-200 transition hover:text-sky-400"
          >
            <ArrowLeft size={16} />
            Terug naar home
          </Link>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
              <ShieldAlert size={14} className="text-red-300" />
              Meldpunt Gif & Overlast
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Eén meldpunt voor de <span className="text-sky-400">hele Belgische kust</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg md:text-xl">
              Meld verdachte stoffen, afval, hondenpoep of andere overlast. Publieke meldingen verschijnen direct, zonder persoonsgegevens of beschuldigingen over personen.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-sky-400"
              >
                <Plus size={18} />
                Nieuwe melding
              </button>
              <a
                href="#meldingen-feed"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/15"
              >
                Bekijk meldingen
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              <AlertTriangle size={14} />
              Belangrijk
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Dit meldpunt is informatief. Voor acute vergiftiging, direct gevaar of dringende interventie contacteer je meteen de lokale hulpdiensten of bevoegde stadsdiensten.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Wat mag hier niet?</h2>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
              <li>Geen namen of identificeerbare beschuldigingen</li>
              <li>Geen telefoonnummers of e-mailadressen</li>
              <li>Geen nummerplaten of links naar derden</li>
            </ul>
          </div>
        </div>

        {createdDetailPath && (
          <div className="mb-6 flex flex-col gap-3 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Je melding staat live.</p>
                <p className="text-sm font-medium">
                  Deelbare link: <Link className="underline underline-offset-2" to={createdDetailPath}>{createdDetailPath}</Link>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}${createdDetailPath}`);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              <Copy size={16} />
              Kopieer link
            </button>
          </div>
        )}

        {flagMessage && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
            {flagMessage}
          </div>
        )}

        <div id="meldingen-feed" className="space-y-6">
          <ReportFilters value={filters} totalCount={filteredReports.length} onChange={setFilters} />

          {loading ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center text-slate-400 shadow-sm">
              Meldingen laden...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-sm font-bold text-red-700 shadow-sm">
              {error}
            </div>
          ) : (
            <ReportFeed
              reports={filteredReports}
              onFlag={async (publicId) => {
                const result = await flagReport(publicId);
                if (result.is_hidden) {
                  setReports((current) => current.filter((report) => report.public_id !== publicId));
                  setFlagMessage('Deze melding is tijdelijk verborgen voor review.');
                  return;
                }

                setReports((current) =>
                  current.map((report) =>
                    report.public_id === publicId
                      ? { ...report, report_count: result.report_count }
                      : report,
                  ),
                );
                setFlagMessage('Dank. De melding is gemarkeerd voor review.');
              }}
            />
          )}
        </div>
      </section>

      <ReportFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={async (detailPath) => {
          setCreatedDetailPath(detailPath);
          setFlagMessage(null);
          await loadReports();
        }}
      />
    </div>
  );
};

export default Meldpunt;
