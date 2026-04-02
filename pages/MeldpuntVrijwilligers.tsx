import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, HeartHandshake, Mail, ShieldCheck, Users } from 'lucide-react';
import { CITIES } from '../cityData.ts';
import { getReportsPath } from '../utils/reportRoutes.ts';
import { useSEO } from '../utils/seo.ts';

const WHATSAPP_MESSAGE = 'Ik wil me graag aanmelden als vrijwilliger voor het meldpunt op HondAanZee voor de gemeente: ';
const WHATSAPP_LINK = `https://wa.me/32494816714?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const WhatsAppLogo = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M19.11 17.27c-.29-.15-1.71-.84-1.97-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.15-1.21-.45-2.31-1.43-.85-.76-1.42-1.69-1.58-1.98-.17-.29-.02-.44.12-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36 0 1.39 1.01 2.73 1.15 2.92.14.19 1.98 3.02 4.8 4.23.67.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33Z" />
    <path d="M16.01 3.2c-7.06 0-12.78 5.71-12.78 12.75 0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.64-1.73a12.8 12.8 0 0 0 6.17 1.57h.01c7.05 0 12.78-5.72 12.78-12.76 0-3.41-1.33-6.62-3.75-9.03A12.7 12.7 0 0 0 16.01 3.2Zm0 23.29h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.94 1.03 1.05-3.84-.25-.4a10.52 10.52 0 0 1-1.62-5.62c0-5.84 4.75-10.58 10.59-10.58 2.83 0 5.49 1.1 7.48 3.1a10.5 10.5 0 0 1 3.1 7.48c0 5.84-4.76 10.58-10.61 10.58Z" />
  </svg>
);

const MeldpuntVrijwilligers: React.FC = () => {
  useSEO({
    title: 'Vrijwilligers voor het Meldpunt | HondAanZee.be',
    description: 'Help mee als vrijwilliger voor het meldpunt aan de Belgische kust. We zoeken per gemeente mensen die stand-by staan om problemen sneller op te volgen en mee te helpen oplossen.',
    canonical: 'https://hondaanzee.be/meldpunt/vrijwilligers',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cities = useMemo(
    () => [...CITIES].map((city) => city.name),
    [],
  );

  return (
    <div className="bg-slate-50">
      <section data-header-hero="light" className="relative overflow-hidden pb-20 pt-24 text-white sm:pt-20 md:pb-24 md:pt-24">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="report-grid-pattern absolute inset-0 opacity-15" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <Link
            to={getReportsPath()}
            className="mb-8 inline-flex items-center gap-2 py-2 text-sm font-bold text-sky-200 transition hover:text-sky-400"
          >
            <ArrowLeft size={16} />
            Terug naar meldpunt
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_380px] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                <Users size={14} className="text-sky-300" />
                Vrijwilligers gezocht
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
                <span className="text-sky-300">Help mee</span> om jouw gemeente <span className="text-sky-300">aan de kust</span>
                <span className="block text-sky-300 md:whitespace-nowrap">veiliger te maken</span>
                <span className="block md:whitespace-nowrap">voor honden en baasjes</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg md:text-xl">
                Voor elke kustgemeente zoeken we mensen die af en toe een oogje in het zeil willen houden. Geen afstandelijke moderatorrol, maar een warme, lokale rol: sneller zien wat er speelt, inschatten waar de risico’s liggen en zorgen dat problemen rond gif of gevaarlijke stoffen snel worden aangepakt.
              </p>
              <div className="mt-6 inline-flex max-w-2xl items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 text-left text-sm font-medium leading-relaxed text-slate-200">
                <HeartHandshake size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                <span>
                  HondAanZee is maar zo sterk als de mensen die lokaal mee willen kijken en mee willen helpen. Als jij jouw gemeente goed kent, kan jouw aanwezigheid echt verschil maken.
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-200">Aanmelden</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                Zin om mee het verschil te maken?
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
                Laat ons weten voor welke gemeente jij wilt helpen. Dan bekijken we samen hoe jouw rol er praktisch uit kan zien.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="mailto:info@hondaanzee.be?subject=Vrijwilliger%20meldpunt%20Hond%20aan%20Zee"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-sky-400"
                >
                  <Mail size={18} />
                  Mail naar info@hondaanzee.be
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-[#25D366] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#1fba57]"
                >
                  <WhatsAppLogo size={18} />
                  WhatsApp 0494 81 67 14
                </a>
              </div>

              <p className="mt-4 text-xs font-medium italic text-slate-300">
                *Graag vermelden met wat en waar jij ons kan ondersteunen
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
              <ShieldCheck size={14} />
              Jouw rol
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Je helpt mee om meldingen in jouw gemeente te verifiëren, baasjes tijdig te waarschuwen en de juiste opvolging in gang te zetten.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              <Users size={14} />
              Lokaal & flexibel
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              We zoeken mensen per kustgemeente die af en toe, wanneer het hen uitkomt, beschikbaar zijn om mee te kijken naar nieuwe meldingen in hun regio.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              <ShieldCheck size={14} />
              De juiste tools
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Je krijgt toegang tot ons speciale HondAanZee-dashboard. Hiermee kun je meldingen beheren, statussen updaten en ingrijpen wanneer dat nodig is.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Wat betekent vrijwilliger zijn concreet?</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Een praktische rol waarmee je echt het verschil maakt.
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">1. Vinger aan de pols houden</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  Je checkt af en toe of er in jouw gemeente nieuwe meldingen zijn binnengekomen die snelle actie vereisen.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">2. Meldingen beheren en updaten</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  Via het dashboard kun je de status van een melding aanpassen. Klopt een melding niet? Is het gevaar geweken omdat de stadsdienst is langs geweest? Jij past het aan, zodat nepnieuws of oude meldingen verdwijnen.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">3. Baasjes betrouwbaar waarschuwen</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  Door jouw actuele updates zorg je ervoor dat de waarschuwingen op ons platform 100% betrouwbaar zijn voor andere wandelaars.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-sky-100 bg-sky-50 px-5 py-5">
              <p className="text-sm font-medium leading-relaxed text-sky-950">
                Goed om te weten: Je hoeft geen officiële stadsmedewerker te zijn. We zoeken simpelweg betrokken mensen die hun gemeente goed kennen en niet wegkijken als er iets aan de hand is.
              </p>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-amber-100 bg-amber-50 px-5 py-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Hoeveel tijd vraagt dit echt?</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-amber-950">
                Geen vast rooster. Geen dagelijkse verplichting. Voor de meeste vrijwilligers betekent dit vooral af en toe meekijken wanneer het hen uitkomt, en alleen reageren wanneer er in hun gemeente echt iets speelt.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Hoe gaat het daarna verder?</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-black text-slate-900">1. Jij stuurt ons een kort bericht</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                    Laat weten voor welke gemeente je wilt helpen en wat je ongeveer kunt betekenen.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-black text-slate-900">2. We stemmen af</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                    We bekijken samen of de rol past bij jouw gemeente, beschikbaarheid en profiel.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-black text-slate-900">3. Daarna krijg je je start</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                    Je krijgt uitleg, toegang tot de nodige tools en we spreken af hoe we jou inschakelen wanneer het nodig is.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Waar zoeken we nu hulp?</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                Voor elke kustgemeente bouwen we een lokaal netwerk uit.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {cities.map((city) => (
                  <div
                    key={city}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                  >
                    <Check size={16} className="shrink-0 text-emerald-600" />
                    <span>{city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MeldpuntVrijwilligers;
