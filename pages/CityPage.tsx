
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusCheck from '../components/StatusCheck.tsx';
import Hotspots from '../components/Hotspots.tsx';
import Services from '../components/Services.tsx';
import OffLeashAreas from '../components/OffLeashAreas.tsx';
import BusinessCTA from '../components/BusinessCTA.tsx';
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
    <div className="animate-in fade-in">
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-sky-600 transition-colors mb-6 sm:mb-8 active:opacity-70 touch-target py-2"
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

      <BusinessCTA />
    </div>
  );
};

export default CityPage;
