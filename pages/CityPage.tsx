
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusCheck from '../components/StatusCheck.tsx';
import Hotspots from '../components/Hotspots.tsx';
import Services from '../components/Services.tsx';
import OffLeashAreas from '../components/OffLeashAreas.tsx';
import BusinessCTA from '../components/BusinessCTA.tsx';
import LocalHero from '../components/LocalHero.tsx';
import { CITIES } from '../cityData.ts';
import { useSEO, getCitySEO } from '../utils/seo.ts';
import { WeatherWidget } from '../components/WeatherWidget.tsx';

const CityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const city = CITIES.find(c => c.slug === slug);

  // Apply SEO metadata
  useSEO(city ? getCitySEO(city.name, city.slug) : {
    title: 'Stad niet gevonden | HondAanZee.be',
    description: 'Deze stad werd niet gevonden in onze database'
  });

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
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 md:pt-32">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 mb-6 sm:mb-8 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/92 backdrop-blur-md border border-white text-slate-900 font-extrabold shadow-lg shadow-slate-900/20 hover:bg-white transition-colors active:opacity-90 touch-target"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="text-sm sm:text-base">Terug naar overzicht</span>
        </Link>
      </div>

      <section className="pb-10 sm:pb-12 md:pb-20 px-4">
        <StatusCheck city={city} />
        <WeatherWidget city={city} />
      </section>

      <OffLeashAreas city={city} />

      <Hotspots city={city} />

      <Services city={city} />

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
