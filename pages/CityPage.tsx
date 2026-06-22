
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import StatusCheck from '../components/StatusCheck.tsx';
import Hotspots from '../components/Hotspots.tsx';
import Services from '../components/Services.tsx';
import OffLeashAreas from '../components/OffLeashAreas.tsx';
import BusinessCTA from '../components/BusinessCTA.tsx';
import LocalHero from '../components/LocalHero.tsx';
import CityFAQ from '../components/CityFAQ.tsx';
import { CITIES } from '../cityData.ts';
import { useSEO, getCitySEO } from '../utils/seo.ts';
import Breadcrumb from '../components/Breadcrumb.tsx';
import { buildCityFAQSchema } from '../utils/cityFaq.ts';

const CityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const city = CITIES.find(c => c.slug === slug);

  const citySEO = city ? getCitySEO(city.name, city.slug) : null;

  // Apply SEO metadata
  useSEO(
    city && citySEO
      ? {
          ...citySEO,
          structuredData: [
            ...(Array.isArray(citySEO.structuredData) ? citySEO.structuredData : [citySEO.structuredData]),
            buildCityFAQSchema(city)
          ]
        }
      : {
          title: 'Stad niet gevonden | HondAanZee.be',
          description: 'Deze stad werd niet gevonden in onze database'
        }
  );

  useEffect(() => {
    if (!city) {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [city, navigate]);

  if (!city) return null;

  return (
    <div className="animate-in fade-in relative isolate">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <img
          src={city.image}
          alt=""
          className="h-full w-full object-cover object-center scale-105"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-slate-950/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/78 via-slate-900/52 to-slate-50/96" />
        <div className="absolute inset-x-0 top-0 h-[52vh] bg-gradient-to-b from-slate-900/38 to-transparent" />

        {/* Editorial LIGHT pane — desktop only.
            Fades from near-white on the left to fully transparent before
            the right column so the answer card still sits on the dark hero.
            Sits in the same fixed layer → extends from the very top of the
            page down to wherever solid white sections begin to cover it. */}
        <div
          className="hidden lg:block absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(248,250,252,0.98) 0%, rgba(248,250,252,0.96) 26%, rgba(248,250,252,0.62) 42%, rgba(248,250,252,0.22) 54%, rgba(248,250,252,0) 66%)',
          }}
        />
      </div>

      <div data-header-hero="light" data-header-hero-mobile-only="true">
        <div className="max-w-3xl lg:max-w-7xl mx-auto px-4 pt-24 sm:pt-28 md:pt-32">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 mb-6 sm:mb-8 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border border-slate-200 text-slate-900 font-extrabold shadow-lg shadow-slate-900/20 hover:bg-slate-50 transition-colors active:opacity-90 touch-target"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">Terug naar overzicht</span>
          </Link>

          {/* Mobile/tablet: light-on-dark breadcrumb */}
          <Breadcrumb
            variant="light"
            className="mb-4 sm:mb-6 lg:hidden"
            items={[
              { label: 'Home', to: '/' },
              { label: city.name },
            ]}
          />
          {/* Desktop: dark text on the new light editorial pane */}
          <Breadcrumb
            variant="default"
            className="mb-4 sm:mb-6 hidden lg:flex"
            items={[
              { label: 'Home', to: '/' },
              { label: city.name },
            ]}
          />
        </div>

        <section className="pb-10 sm:pb-12 md:pb-20 px-4">
          <StatusCheck city={city} />
        </section>
      </div>

      <OffLeashAreas city={city} />

      <Hotspots city={city} />

      <Services city={city} />

      <CityFAQ city={city} />

      <section className="bg-white py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="grid gap-5 p-6 sm:p-7 md:grid-cols-[minmax(0,1.35fr)_auto] md:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
                  <Users size={14} />
                  Vrijwilligers in {city.name}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Ken jij {city.name} goed?
                </h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                  Voor het meldpunt zoeken we ook in {city.name} betrokken mensen die af en toe een oogje in het zeil willen houden bij meldingen rond gif, gevaarlijke stoffen en andere risico&apos;s.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:items-end">
                <Link
                  to="/meldpunt/vrijwilligers"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-sky-700"
                >
                  <Users size={18} />
                  Meer over vrijwilligers
                </Link>
                <p className="text-xs font-medium text-slate-500">
                  Lees eerst wat de rol inhoudt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Hero: random aanrader shout-out for this city */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <LocalHero citySlug={city.slug} cityName={city.name} />
        </div>
      </section>

      <BusinessCTA />
    </div>
  );
};

export default CityPage;
