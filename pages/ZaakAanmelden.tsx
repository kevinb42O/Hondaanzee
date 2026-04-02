import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HeartHandshake, Mail, Megaphone, PawPrint, ShieldCheck, Star } from 'lucide-react';
import { useSEO } from '../utils/seo.ts';

const WHATSAPP_MESSAGE = 'Dag! 👋\n\nIk wil mijn hondvriendelijke zaak graag aanmelden op hondaanzee.be.\n\nNaam zaak:\nGemeente:\nWat maakt jullie zaak hondvriendelijk?\n\nBedankt!';
const WHATSAPP_URL = `https://wa.me/32494816714?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const MAIL_URL = 'mailto:info@hondaanzee.be?subject=Zaak%20aanmelden%20op%20HondAanZee.be';

const ZaakAanmelden: React.FC = () => {
  useSEO({
    title: 'Zaak Aanmelden | HondAanZee.be',
    description: 'Heb jij een hondvriendelijke zaak aan de Belgische kust? Ontdek waarom een vermelding op HondAanZee.be interessant is en meld je zaak aan via WhatsApp of e-mail.',
    canonical: 'https://hondaanzee.be/zaak-aanmelden',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50">
      <section data-header-hero="light" className="relative overflow-hidden pb-20 pt-24 text-white sm:pt-20 md:pb-24 md:pt-24">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.10),transparent_30%)]" />
        <div className="report-grid-pattern absolute inset-0 opacity-15" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 py-2 text-sm font-bold text-sky-200 transition hover:text-sky-400"
          >
            <ArrowLeft size={16} />
            Terug naar home
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_400px] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                <Megaphone size={14} className="text-sky-300" />
                Zaak aanmelden
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Heb jij een <span className="text-sky-300">hondvriendelijke zaak</span> aan de kust?
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg md:text-xl">
                Dan kan je gratis vermeld worden op HondAanZee.be. Zo bereik je precies de mensen die met hun hond aan zee op zoek zijn naar fijne plekken om naartoe te gaan.
              </p>
              <div className="mt-6 inline-flex max-w-2xl items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 text-left text-sm font-medium leading-relaxed text-slate-200">
                <HeartHandshake size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                <span>
                  Een gratis vermelding is de basis. Wil je extra opvallen aan je deur of raam? Dan kan je ook onze sticker aanvragen.
                </span>
              </div>
            </div>

            <Link
              to="/steun-ons#sticker"
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md transition hover:-translate-y-1 hover:border-white/20"
            >
              <img
                src="/sticker.webp"
                alt="HondAanZee keurmerk sticker"
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="border-t border-white/10 px-5 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-200">Sticker mogelijk</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">
                  Naast je gratis vermelding kan je ook een HondAanZee-sticker aanvragen voor je zaak.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
              <Megaphone size={14} />
              Gratis vermelding
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Je zaak komt gratis op HondAanZee.be, waar hondeneigenaars doelgericht zoeken naar hondvriendelijke adressen aan de kust.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              <ShieldCheck size={14} />
              Meer vertrouwen
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Een duidelijke vermelding toont meteen dat honden echt welkom zijn. Dat verlaagt twijfels en maakt de stap kleiner om bij jou binnen te komen.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              <Star size={14} />
              Sticker mogelijk
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
              Wil je nog duidelijker tonen dat honden welkom zijn? Dan kan je ook een HondAanZee-sticker aanvragen voor je zaak.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Wat stuur je best mee?</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Kort en simpel is genoeg.
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">1. Je zaak</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  De naam van je zaak, de gemeente en liefst ook je adres of website.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">2. Waarom honden welkom zijn</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  Bijvoorbeeld waterbakjes, honden welkom op terras, koekjes, ruime toegang of een echt warm onthaal.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">3. Extra info of foto&apos;s</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  Heb je foto&apos;s of extra info? Dan kunnen we je vermelding sterker en aantrekkelijker maken.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-sky-100 bg-sky-50 px-5 py-5">
              <p className="text-sm font-medium leading-relaxed text-sky-950">
                Belangrijk: een vermelding op HondAanZee.be is gratis. We nemen alleen zaken op waar honden ook echt welkom zijn. Na je aanmelding komen Jax en ik bovendien zelf langs, zodat we elke zaak persoonlijk leren kennen.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-200">Aanmelden</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Gratis je zaak aanmelden?
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
                Stuur ons je gegevens door en vertel kort wat jouw zaak hondvriendelijk maakt. Wil je ook een sticker aanvragen? Zet dat er gewoon meteen bij.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={MAIL_URL}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-sky-400"
                >
                  <Mail size={18} />
                  Aanmelden via e-mail
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-[#25D366] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#1fba57]"
                >
                  <PawPrint size={18} />
                  Aanmelden via WhatsApp
                </a>
              </div>

              <p className="mt-4 text-xs font-medium italic text-slate-400">
                Vermeld liefst naam zaak, gemeente, link of adres, wat jullie hondvriendelijk maakt, en of je ook een sticker wilt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZaakAanmelden;
