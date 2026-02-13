
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coffee, Utensils, Bed, Star, MapPin, Filter, X } from 'lucide-react';
import { HOTSPOTS } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import PlaceModal from '../components/PlaceModal.tsx';
import { Hotspot } from '../types.ts';

const AllHotspots: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedHotspot(null), 300); // Clear after animation
  };

  // Apply SEO metadata
  useSEO(SEO_DATA.hotspots);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Café': return <Coffee size={14} />;
      case 'Restaurant': return <Utensils size={14} />;
      case 'Slapen': return <Bed size={14} />;
      default: return <Star size={14} />;
    }
  };

  const filteredHotspots = useMemo(() => {
    return HOTSPOTS
      .filter(spot => {
        const cityMatch = selectedCity === 'all' || spot.city === selectedCity;
        const typeMatch = selectedType === 'all' || spot.type === selectedType;
        return cityMatch && typeMatch;
      })
      .sort((a, b) => {
        const aIsAanrader = a.tags.includes('Aanrader') ? 1 : 0;
        const bIsAanrader = b.tags.includes('Aanrader') ? 1 : 0;
        return bIsAanrader - aIsAanrader;
      });
  }, [selectedCity, selectedType]);

  const types = ['all', ...Array.from(new Set(HOTSPOTS.map(spot => spot.type)))];
  const citiesWithHotspots = useMemo(() => {
    const citySet = new Set(HOTSPOTS.map(spot => spot.city));
    return CITIES.filter(city => citySet.has(city.slug));
  }, []);

  const getCityName = (slug: string) => {
    return CITIES.find(city => city.slug === slug)?.name || slug;
  };

  const hasFilters = selectedCity !== 'all' || selectedType !== 'all';

  return (
    <div className="animate-in fade-in overflow-x-clip">
      <div className="relative pt-12 sm:pt-16 md:pt-24 pb-24 sm:pb-32 md:pb-40 overflow-hidden min-h-[50vh] flex items-center text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/coffeedog.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/40"></div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 text-slate-700/30 hidden md:block" style={{ animation: 'float 3.5s ease-in-out infinite' }}>
          <Coffee size={70} strokeWidth={1.5} />
        </div>
        <div className="absolute top-32 left-16 text-slate-700/30 hidden md:block" style={{ animation: 'pulse 3s ease-in-out infinite' }}>
          <Bed size={60} strokeWidth={1.5} />
        </div>
        <div className="absolute top-1/2 right-8 text-slate-700/25 hidden md:block rotate-12">
          <Star size={50} strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-40 left-20 text-slate-700/30 hidden lg:block" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
          <MapPin size={55} strokeWidth={1.5} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-300 font-bold hover:text-sky-400 transition-colors mb-6 sm:mb-8 active:opacity-70 touch-target py-2"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">Terug naar home</span>
          </Link>

          <div className="max-w-3xl relative">
            <div className="absolute -left-20 top-0 text-6xl hidden xl:block" style={{ animation: 'float 2.5s ease-in-out infinite' }}>
              ☕
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Alle Hondvriendelijke <span className="text-sky-400">Hotspots</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed font-medium">
              Ontdek alle hondvriendelijke plekjes aan de Belgische kust. Filter op stad of type om jouw perfecte spot te vinden.
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute -bottom-3 left-0 w-full overflow-x-clip overflow-y-visible leading-[0] z-10">
          <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100vw', flex: '0 0 100vw' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-slate-50"
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
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-slate-50"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 sm:py-12 md:py-16">
        {/* Filters */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="bg-sky-100 text-sky-600 p-2 sm:p-2.5 rounded-xl">
              <Filter size={18} className="sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Filters</h2>
            {hasFilters && (
              <button
                onClick={() => {
                  setSelectedCity('all');
                  setSelectedType('all');
                }}
                className="ml-auto text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-2"
              >
                <X size={16} /> Wis filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* City Filter */}
            <fieldset>
              <legend className="block text-sm font-bold text-slate-700 mb-3">
                <MapPin size={14} className="inline mr-2" />
                Gemeente
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity('all')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCity === 'all'
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Alle
                </button>
                {citiesWithHotspots.map(city => (
                  <button
                    key={city.slug}
                    onClick={() => setSelectedCity(city.slug)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCity === city.slug
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Type Filter */}
            <fieldset>
              <legend className="block text-sm font-bold text-slate-700 mb-3">
                Type
              </legend>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${selectedType === type
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {type !== 'all' && <span className="opacity-70">{getIcon(type)}</span>}
                    {type === 'all' ? 'Alle' : type}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 sm:mb-8">
          <p className="text-slate-600 font-bold text-sm sm:text-base">
            <span className="text-sky-600 text-lg sm:text-xl">{filteredHotspots.length}</span> {filteredHotspots.length === 1 ? 'hotspot' : 'hotspots'} gevonden
          </p>
        </div>

        {/* Hotspots Grid */}
        {filteredHotspots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-stretch">
            {filteredHotspots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col"
                onClick={() => handleHotspotClick(spot)}
              >
                <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110"
                    width={400}
                    height={256}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/20">
                    <span className="text-sky-600">{getIcon(spot.type)}</span> {spot.type}
                  </div>
                  <span
                    role="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/${spot.city}`;
                    }}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-slate-900/90 backdrop-blur text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-sky-600 transition-colors cursor-pointer"
                  >
                    <MapPin size={10} /> {getCityName(spot.city)}
                  </span>
                  {spot.tags.includes('Aanrader') && (
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }}>
                      <svg width="16" height="16" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="starGoldAll" x1="0" y1="0" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                        <path d="M20 0l5.09 12.26L38.04 14.6 28.02 23.74 30.18 37 20 30.76 9.82 37l2.16-13.26L2 14.6l12.91-2.34z" fill="url(#starGoldAll)" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Aanrader</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-sky-600 md:transition-colors">{spot.name}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{spot.description}</p>
                <div className="mt-auto">
                  {spot.address && (
                    <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{spot.address}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  {spot.tags.filter(tag => tag !== 'Aanrader').map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border bg-sky-50 text-sky-600 border-sky-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>                </div>              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 md:py-24">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16 max-w-2xl mx-auto">
              <div className="text-slate-300 mb-6">
                <Coffee size={48} className="mx-auto" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                {selectedCity !== 'all' && selectedType !== 'all'
                  ? `Geen ${selectedType.toLowerCase()} in ${getCityName(selectedCity)}`
                  : selectedType !== 'all'
                  ? `Geen ${selectedType.toLowerCase()} gevonden`
                  : selectedCity !== 'all'
                  ? `Geen hotspots in ${getCityName(selectedCity)}`
                  : 'Geen hotspots gevonden'}
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                {selectedCity !== 'all' && selectedType !== 'all'
                  ? `Momenteel zijn er geen hotspots van het type "${selectedType}" in ${getCityName(selectedCity)}. Probeer een ander type of bekijk alle locaties in deze gemeente.`
                  : 'Er zijn geen hotspots die aan deze filters voldoen. Probeer andere filters te selecteren.'}
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSelectedCity('all');
                    setSelectedType('all');
                  }}
                  className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors"
                >
                  <X size={16} /> Wis alle filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PlaceModal
        place={selectedHotspot}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accentColor="sky"
      />
    </div>
  );
};

export default AllHotspots;
