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
      <section data-header-hero="light" className="relative overflow-hidden pb-24 pt-24 text-white sm:pt-20 md:pb-32 md:pt-24">
        <div className="absolute inset-0 bg-slate-950" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/properstrand.webp)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="report-grid-pattern absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_32%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-950/50 to-slate-950" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 py-2 text-sm font-bold text-sky-200 transition hover:text-sky-400"
          >
            <ArrowLeft size={16} />
            Terug naar home
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_360px] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
              <ShieldAlert size={14} className="text-red-300" />
              Meldpunt Gif & Overlast
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Publiek meldpunt voor <span className="text-sky-300">gif, verdachte stoffen en overlast</span> aan de Belgische kust
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg md:text-xl">
                Eén kustbreed overzicht voor signalen op straat, in parken en rond losloopzones. Meldingen komen publiek in beeld en kunnen zichtbaar worden opgevolgd door bevoegde stadsdiensten.
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
                  Bekijk publieke feed
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-200">Zo gebruik je dit meldpunt</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">Iets verdachts of vuils gezien? Kijk of het al gemeld is, of zet het er zelf meteen bij.</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
                Gebruik de filters als je wilt checken wat er al gemeld werd. Wil je zelf iets doorgeven, hou het dan simpel: wat lag er, waar lag het en wanneer heb je het gezien?
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-200">Wat zet je erbij?</p>
                  <p className="mt-2 text-sm font-medium text-slate-200">Een duidelijke locatie, een korte beschrijving en het moment waarop je het zag.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-200">Zie je direct gevaar?</p>
                  <p className="mt-2 text-sm font-medium text-slate-200">Bel meteen de hulpdiensten of de bevoegde stadsdienst. Dit meldpunt is alleen om meldingen zichtbaar te maken.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              <AlertTriangle size={14} />
              Belangrijk
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Dit meldpunt is informatief. Voor acute vergiftiging, direct gevaar of dringende interventie contacteer je meteen de lokale hulpdiensten of bevoegde stadsdiensten.
            </p>
          </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Publieke lijn</p>
              <h2 className="mt-2 text-lg font-black tracking-tight text-slate-900">Wat mag hier niet?</h2>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
              <li>Geen namen of identificeerbare beschuldigingen</li>
              <li>Geen telefoonnummers of e-mailadressen</li>
              <li>Geen nummerplaten of links naar derden</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Opvolging</p>
            <h2 className="mt-2 text-lg font-black tracking-tight text-slate-900">Wat zie je hier terug?</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              Eerst vooral de melding zelf. Als een stad of dienst later een update krijgt toegevoegd, zie je dat er ook meteen bij staan.
            </p>
          </div>
        </div>

        {createdDetailPath && (
          <div className="mb-6 flex flex-col gap-3 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            {flagMessage}
          </div>
        )}

        <div id="meldingen-feed" className="space-y-6">
          <ReportFilters value={filters} totalCount={filteredReports.length} onChange={setFilters} />

          {loading ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center text-slate-400 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
              Meldingen laden...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-sm font-bold text-red-700 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
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
