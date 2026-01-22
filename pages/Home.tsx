
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Waves, MapPin, Search, X, Sparkles } from 'lucide-react';
import { CITIES } from '../cityData.ts';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Premium smooth parallax effect
  useEffect(() => {
    let ticking = false;
    let currentOffset = 0;
    let targetOffset = 0;

    const smoothParallax = () => {
      // Smooth interpolation (ease out) - slower for premium feel
      currentOffset += (targetOffset - currentOffset) * 0.05;
      
      if (Math.abs(targetOffset - currentOffset) > 0.1) {
        setParallaxOffset(currentOffset);
        requestAnimationFrame(smoothParallax);
      } else {
        setParallaxOffset(targetOffset);
        ticking = false;
      }
    };

    const handleScroll = () => {
      // Very subtle parallax - only 10% of scroll speed for premium feel
      targetOffset = window.scrollY * 0.1;
      
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(smoothParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredCities = useMemo(() => {
    return CITIES.filter((city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="pb-12 md:pb-24 overflow-hidden">
      {/* Hero Section with Dynamic Background */}
      <div className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pb-32 sm:pb-40 md:pb-48 overflow-hidden">
        {/* Background Image with Premium Parallax Effect */}
        <div 
          className="absolute inset-0 z-0 transition-transform duration-75 ease-out" 
          style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }}
        >
          <img 
            src="/lexi.webp" 
            alt="Blije hond op het strand"
            className="w-full h-[120%] object-cover animate-in fade-in duration-1000"
            style={{ objectPosition: 'center 30%' }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          {/* Multi-layer Overlay for contrast */}
          <div className="absolute inset-0 bg-slate-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-900/50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-20 text-center safe-area-left safe-area-right">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 shadow-xl">
             <Sparkles size={12} className="text-sky-300 sm:w-[14px] sm:h-[14px]" /> De meest complete kustgids van België
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[6.5rem] font-bold text-white mb-6 sm:mb-8 leading-[1.15] max-w-5xl mx-auto px-2 drop-shadow-2xl font-heading" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)', letterSpacing: '-0.5px', fontWeight: 700 }}>
            Met je hond naar zee? <br className="hidden sm:block" />
            <span className="text-sky-300 relative inline-block">
              Wij weten precies
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-4 left-0 w-full h-3 sm:h-4 text-sky-300/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8"/>
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
                className="search-input flex-1 px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 bg-transparent text-base sm:text-lg md:text-xl text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none font-heading min-w-0"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-btn p-2 text-slate-300 hover:text-slate-600 touch-target"
                  aria-label="Wis zoekopdracht"
                >
                  <X size={20} className="sm:w-[22px] sm:h-[22px]" />
                </button>
              )}
              <button className="btn-lift bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-heading whitespace-nowrap touch-target">
                Zoeken
              </button>
            </div>
            
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
               <span className="popular-label text-[9px] sm:text-[10px] font-medium text-white/70 uppercase tracking-[0.15em] sm:tracking-[0.2em] w-full sm:w-auto text-center mb-2 sm:mb-0">Populair</span>
               {['Oostende', 'Blankenberge', 'Knokke'].map((pop, index) => (
                 <button 
                  key={pop}
                  onClick={() => setSearchQuery(pop)}
                  className="popular-pill group relative text-xs sm:text-sm font-medium text-white/90 hover:text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-heading transition-all duration-300 active:scale-95 touch-target"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 24px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    animationDelay: `${0.6 + index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.boxShadow = '0 8px 32px -1px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.boxShadow = '0 4px 24px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                 >
                   {pop}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Organic Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 rotate-180">
          <svg 
            className="relative block w-[calc(100%+1.3px)] h-[60px] sm:h-[80px] md:h-[120px]" 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              className="fill-current text-stone-50"
            />
          </svg>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8">
              {filteredCities.map((city, index) => (
                <Link 
                  key={city.slug} 
                  to={`/${city.slug}`}
                  className="city-card group relative h-64 sm:h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-sm block bg-slate-100 active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${Math.min(index * 0.1, 0.5)}s` }}
                >
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="w-full h-full object-cover md:transition-transform md:duration-700 md:ease-out md:group-hover:scale-105"
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index < 3 ? "high" : "low"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-14 text-white">
                    <div className="flex items-center gap-2 text-sky-300 font-black text-[10px] md:text-xs uppercase tracking-[0.25em] mb-4 drop-shadow-sm">
                      <MapPin size={16} />
                      Ontdek {city.name}
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4 flex items-center justify-between tracking-tighter">
                      {city.name}
                      <div className="bg-white/10 backdrop-blur-2xl p-2.5 sm:p-3.5 rounded-full md:transition-colors md:duration-300 md:group-hover:bg-sky-600 shadow-xl">
                        <ArrowRight size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
                      </div>
                    </h3>
                    <p className="text-slate-100 text-xs sm:text-sm md:text-lg line-clamp-2 font-semibold leading-relaxed opacity-90">
                      {city.description}
                    </p>
                  </div>
                </Link>
              ))}
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
