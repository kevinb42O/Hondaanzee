
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Waves, MapPin, Search, X, Sparkles } from 'lucide-react';
import { CITIES } from '../cityData.ts';
import { findNearestCity } from '../utils/geo.ts';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  // Scroll to results section
  const scrollToResults = () => {
    const stedenSection = document.getElementById('steden');
    if (stedenSection) {
      stedenSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocatie wordt niet ondersteund door je browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const nearest = findNearestCity(coords);
        if (nearest) {
          navigate(`/${nearest.slug}`);
        } else {
          alert('Geen kuststad gevonden in de buurt');
        }
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Kon je locatie niet bepalen. Controleer of je locatietoegang hebt toegestaan.');
        setIsLocating(false);
      }
    );
  };

  const filteredCities = useMemo(() => {
    return CITIES.filter((city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="pb-12 md:pb-24 overflow-x-clip overflow-y-visible">
      {/* Hero Section with Dynamic Background */}
      <div className="relative -mt-[72px] sm:-mt-[80px] md:-mt-[96px] pt-[72px] sm:pt-[80px] md:pt-[96px] min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pb-32 sm:pb-40 md:pb-48 overflow-hidden">
        {/* Background Image with CSS Parallax */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/lexi.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Multi-layer Overlay for contrast */}
          <div className="absolute inset-0 bg-slate-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-900/50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-20 text-center safe-area-left safe-area-right">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-900 px-5 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-4 shadow-2xl rotate-[-1deg] hover:rotate-0 transition-transform duration-300" style={{ boxShadow: '0 10px 30px -5px rgba(0,0,0,0.4), 0 4px 10px -2px rgba(0,0,0,0.3)' }}>
            <Sparkles size={12} className="text-sky-500 sm:w-[14px] sm:h-[14px]" strokeWidth={3} />
            <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">De meest complete kustgids van België</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[6.5rem] font-bold text-white mb-6 sm:mb-8 leading-[1.15] max-w-5xl mx-auto px-2 drop-shadow-2xl font-heading" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)', letterSpacing: '-0.5px', fontWeight: 700 }}>
            Met je hond naar zee? <br className="hidden sm:block" />
            <span className="text-sky-300 relative inline-block">
              Wij weten precies
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-4 left-0 w-full h-3 sm:h-4 text-sky-300/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span> waar het mag.
          </h1>

          <p className="text-slate-100 max-w-3xl mx-auto leading-relaxed px-4 mb-10 sm:mb-14 text-sm sm:text-base md:text-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)', fontWeight: 400 }}>
            Nooit meer gissen naar strandregels. Ontdek real-time toegankelijkheid,
            <span className="text-white font-semibold"> verborgen losloopweides</span> en de meest gastvrije hotspots voor jou en je viervoeter.
          </p>

          <div className="max-w-2xl mx-auto relative px-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="search-container focus-ring flex items-center bg-white rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-white/50 p-1.5 sm:p-2 focus-within:border-sky-500">
              <div className="pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
                <Search size={20} className="search-icon text-slate-400 sm:w-[22px] sm:h-[22px]" />
              </div>
              <input
                type="text"
                placeholder="Waar gaan jullie wandelen?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    scrollToResults();
                  }
                }}
                className="search-input flex-1 px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 bg-transparent text-base sm:text-lg md:text-xl text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none font-heading min-w-0"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-btn p-2 text-slate-300 hover:text-slate-600 touch-target"
                  aria-label="Wis zoekopdracht"
                >
                  <X size={20} className="sm:w-[22px] sm:h-[22px]" />
                </button>
              ) : (
                <button
                  onClick={handleUseLocation}
                  disabled={isLocating}
                  className={`p-2 mr-1 transition-colors touch-target ${isLocating ? 'text-sky-400 animate-pulse' : 'text-slate-300 hover:text-sky-600'}`}
                  aria-label="Gebruik mijn locatie"
                  title="Vind dichtstbijzijnde badstad"
                >
                  <MapPin size={20} className="sm:w-[22px] sm:h-[22px]" />
                </button>
              )}
              <button
                onClick={scrollToResults}
                className="btn-lift bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-heading whitespace-nowrap touch-target"
              >
                Zoeken
              </button>
            </div>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span className="popular-label text-[9px] sm:text-[10px] font-medium text-white/70 uppercase tracking-[0.15em] sm:tracking-[0.2em] w-full sm:w-auto text-center mb-2 sm:mb-0">Populair</span>
              {['Oostende', 'Blankenberge', 'Knokke'].map((pop, index) => (
                <button
                  key={pop}
                  onClick={() => setSearchQuery(pop)}
                  className="popular-pill group relative text-xs sm:text-sm font-semibold text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-heading transition-all duration-300 hover:scale-105 hover:bg-white hover:text-slate-900 active:scale-95 touch-target bg-white/20 backdrop-blur-sm border border-white/30"
                  style={{
                    animationDelay: `${0.6 + index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    // Hover handled by Tailwind classes
                  }}
                  onMouseLeave={(e) => {
                    // Hover handled by Tailwind classes
                    e.currentTarget.style.boxShadow = '0 4px 24px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                >
                  {pop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organic Wave Divider with Infinite Animation */}
        <div className="absolute bottom-0 left-0 w-full overflow-x-clip overflow-y-visible leading-[0] z-10">
          <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100vw', flex: '0 0 100vw' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C150,30 300,90 450,60 C600,30 750,90 900,60 C1050,30 1150,60 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-stone-50"
              />
            </svg>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100vw', flex: '0 0 100vw' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C150,30 300,90 450,60 C600,30 750,90 900,60 C1050,30 1150,60 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-stone-50"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Cities Grid Section with Warm Background */}
      <div className="bg-stone-50 py-12 sm:py-16 md:py-20">
        <div id="steden" className="max-w-7xl mx-auto px-4 scroll-mt-24">
          {/* Cities Grid Header */}
          <div className="mb-10 flex items-center justify-between px-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Waves size={24} className="text-sky-500" />
              Onze Badsteden
            </h2>
            <div className="hidden sm:block text-sm font-bold text-slate-400 uppercase tracking-widest">
              Totaal: {filteredCities.length} resultaten
            </div>
          </div>

          {filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px]">
              {filteredCities.map((city, index) => {
                // Z-Pattern Anchor Layout: Perfect 10 items grid
                const isFirstItem = index === 0;
                const isLastItem = index === filteredCities.length - 1;
                const isFeatured = isFirstItem || isLastItem;

                const gridClass = isFeatured ? 'md:col-span-2' : 'md:col-span-1';

                return (
                  <Link
                    key={city.slug}
                    to={`/${city.slug}`}
                    className={`city-card group relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-md block bg-slate-100 active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-2xl transition-all duration-300 ${gridClass}`}
                    style={{ animationDelay: `${Math.min(index * 0.08, 0.5)}s` }}
                  >
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover md:transition-transform md:duration-700 md:ease-out md:group-hover:scale-105"
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index < 3 ? "high" : "low"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-6 lg:p-8 text-white">
                      <div className="flex items-center gap-2 text-sky-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.25em] mb-2 sm:mb-3 drop-shadow-lg">
                        <MapPin size={14} className="sm:w-4 sm:h-4" />
                        Ontdek {city.name}
                      </div>
                      <h3 className={`font-black mb-2 sm:mb-3 flex items-center justify-between tracking-tighter drop-shadow-lg ${isFeatured ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl lg:text-3xl'
                        }`}>
                        {city.name}
                        <div className="bg-white/10 backdrop-blur-2xl p-2 sm:p-2.5 lg:p-3 rounded-full md:transition-all md:duration-300 md:group-hover:bg-sky-600 md:group-hover:scale-110 shadow-xl flex-shrink-0">
                          <ArrowRight size={18} strokeWidth={3} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                      </h3>
                      <p className={`text-slate-100 font-medium leading-relaxed opacity-95 drop-shadow-md ${isFeatured ? 'hidden md:block text-sm lg:text-base line-clamp-2' : 'text-xs sm:text-sm line-clamp-2'
                        }`}>
                        {city.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 md:py-32 px-6 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 animate-in fade-in shadow-inner">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                <Search size={48} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Geen stad gevonden</h2>
              <p className="text-slate-500 font-medium text-lg mb-10 max-w-md mx-auto">
                We hebben geen match voor "<span className="text-slate-900 font-bold">{searchQuery}</span>". Probeer een andere badstad of bekijk de volledige lijst.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-lift bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-sky-600 shadow-2xl shadow-slate-900/20 flex items-center gap-3 mx-auto"
              >
                Reset zoekopdracht
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
