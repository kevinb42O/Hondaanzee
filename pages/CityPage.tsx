
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import StatusCheck from '../components/StatusCheck.tsx';
import Hotspots from '../components/Hotspots.tsx';
import Services from '../components/Services.tsx';
import { CityEventLinks } from '../components/EventLinks.tsx';
import OffLeashAreas from '../components/OffLeashAreas.tsx';
import BusinessCTA from '../components/BusinessCTA.tsx';
import CityFAQ from '../components/CityFAQ.tsx';
import SupportPrompt from '../components/SupportPrompt.tsx';
import { CITIES } from '../cityData.ts';
import { useSEO, getCitySEO } from '../utils/seo.ts';
import NotFound from './NotFound';
import { buildCityFAQSchema } from '../utils/cityFaq.ts';

const CityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
          title: 'Pagina niet gevonden | HondAanZee.be',
          description: 'Deze pagina bestaat helaas niet (meer). Ga terug naar de homepage voor alle informatie over honden aan de Belgische kust.',
          noindex: true,
        }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [city]);

  if (!city) return <NotFound />;

  return (
    <div className="city-page">
      <StatusCheck key={city.slug} city={city} />
      <OffLeashAreas key={`zones-${city.slug}`} city={city} />
      <Hotspots key={`hotspots-${city.slug}`} city={city} />
      <Services key={`services-${city.slug}`} city={city} />
      <CityEventLinks citySlug={city.slug} cityName={city.name} />
      <CityFAQ key={`faq-${city.slug}`} city={city} />

      <section className="city-section city-community" aria-label="Help mee aan de kustgids">
        <div className="city-shell city-community-grid">
          <SupportPrompt cityName={city.name} />
          <div>
            <p className="city-eyebrow"><Users size={15} aria-hidden="true" />Vrijwilligers in {city.name}</p>
            <h2 className="city-small-title">Ken jij {city.name} goed?</h2>
            <p className="city-body-copy">Help af en toe bij meldingen rond gif, gevaarlijke stoffen en andere risico’s. Lees wat de rol inhoudt en hoe je kunt bijdragen.</p>
            <Link to="/meldpunt/vrijwilligers" className="city-text-link">
              Meer over vrijwilligers <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <BusinessCTA />
    </div>
  );
};

export default CityPage;
