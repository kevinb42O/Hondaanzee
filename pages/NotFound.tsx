
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, MapPin } from 'lucide-react';
import { useSEO } from '../utils/seo.ts';

const NotFound: React.FC = () => {
  useSEO({
    title: 'Pagina niet gevonden | HondAanZee.be',
    description: 'Deze pagina bestaat helaas niet (meer). Ga terug naar de homepage voor alle informatie over honden aan de Belgische kust.',
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-sky-100 rounded-full mb-6">
            <span className="text-5xl sm:text-6xl">🐕</span>
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-slate-900 mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Oeps, deze pagina is verdwaald
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-8">
            Net als een hond die z'n bal kwijt is... deze pagina bestaat helaas niet (meer). 
            Laten we samen terug naar de kust gaan!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/30 w-full sm:w-auto justify-center"
          >
            <Home size={20} />
            Terug naar home
          </Link>
          <Link
            to="/hotspots"
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:bg-slate-200 transition-colors w-full sm:w-auto justify-center"
          >
            <Search size={20} />
            Bekijk hotspots
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Populaire steden:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['oostende', 'blankenberge', 'knokke-heist', 'de-haan'].map((city) => (
              <Link
                key={city}
                to={`/${city}`}
                className="inline-flex items-center gap-2 text-sky-600 font-bold px-4 py-2 rounded-xl hover:bg-sky-50 transition-colors text-sm"
              >
                <MapPin size={14} />
                {city === 'de-haan' ? 'De Haan'
                  : city === 'knokke-heist' ? 'Knokke-Heist'
                  : city.charAt(0).toUpperCase() + city.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
