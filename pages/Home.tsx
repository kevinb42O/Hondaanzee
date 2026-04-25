
import React, { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Waves, MapPin, Search, X, ChevronDown, CheckCircle2, AlertCircle, Users, Megaphone } from 'lucide-react';
import { CITIES } from '../cityData.ts';
import type { City } from '../types.ts';

import { findNearestCity } from '../utils/geo.ts';
import { evaluateCityRuleStatus } from '../utils/rules.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

// Kustlijn volgorde NO → ZW
const COASTLINE_ORDER = [
  'knokke-heist', 'zeebrugge', 'blankenberge', 'wenduine', 'de-haan',
  'bredene', 'oostende', 'middelkerke', 'nieuwpoort', 'koksijde', 'de-panne'
];

// Grid layout (6-col): elke rij telt op tot 6
// Rij 1: [flex]      — Knokke + Zeebrugge (apart, met hover-swap)
// Rij 2: [4][2]      — Blankenberge groot
// Rij 3: [2][4]      — Bredene groot (zigzag)
// Rij 4: [4][2]      — Oostende groot (featured)
// Rij 5: [2][2][2]   — 3 gelijk (rustpunt)
const FULL_LAYOUT = [4, 2, 2, 4, 4, 2, 2, 2, 2];

// Fallback: repeating pattern for filtered results
const FALLBACK_PATTERN = [2, 2, 2];

const getGridSpan = (index: number, total: number): number => {
  if (total === FULL_LAYOUT.length) return FULL_LAYOUT[index];
  if (total >= 5) {
    // Repeating pattern: [3,3] then [2,2,2,...]
    if (index < 2) return 3;
    return 2;
  }
  return FALLBACK_PATTERN[index % FALLBACK_PATTERN.length];
};

const getGridClass = (index: number, total: number): string => {
  const span = getGridSpan(index, total);
  if (span === 4) return 'sm:col-span-2 lg:col-span-4';
  if (span === 3) return 'lg:col-span-3';
  return 'lg:col-span-2';
};

// Steden die dezelfde hoogte krijgen als de grote kaarten
const TALL_CARDS = new Set(['wenduine', 'de-haan', 'de-panne', 'oostende', 'middelkerke', 'nieuwpoort', 'koksijde']);

// Images with pre-generated 640w responsive variants
const RESPONSIVE_IMAGES = new Set([
  '/knokke.webp', '/zeebrugge.webp', '/blankenberge-new.webp', '/wenduine.webp'
]);

const getResponsiveSrcSet = (image: string): string | undefined => {
  if (!RESPONSIVE_IMAGES.has(image)) return undefined;
  const base = image.replace('.webp', '');
  return `${base}-640w.webp 640w, ${image} 960w`;
};

const STATUS_BADGE_CONFIG = {
  JA: {
    label: 'Toegelaten',
    icon: CheckCircle2,
    containerClass: 'bg-emerald-500/90 text-white ring-emerald-200/80'
  },
  DEELS: {
    label: 'Beperkt',
    icon: AlertCircle,
    containerClass: 'bg-amber-500/90 text-white ring-amber-200/80'
  },
  NEE: {
    label: 'Verboden',
    icon: X,
    containerClass: 'bg-rose-600/90 text-white ring-rose-200/80'
  }
} as const;

const CityCard: React.FC<{ city: City; index: number; total: number }> = ({ city, index, total }) => {
  const span = getGridSpan(index, total);
  const isFeatured = span >= 4;
  const isMedium = span === 3;
  const isTall = TALL_CARDS.has(city.slug);
  const gridClass = getGridClass(index, total);
  const heightClass = isFeatured || isTall
    ? 'h-[300px] sm:h-[340px] lg:h-[380px]'
    : isMedium
      ? 'h-[280px] sm:h-[300px] lg:h-[340px]'
      : 'h-[260px] sm:h-[280px]';
  const srcSet = getResponsiveSrcSet(city.image);

  return (
    <Link
      key={city.slug}
      to={`/${city.slug}`}
      className={`city-card group relative rounded-2xl lg:rounded-3xl overflow-hidden block bg-slate-100 active:scale-[0.98] md:hover:-translate-y-1.5 transition-all duration-500 ease-out ${gridClass} ${heightClass} ${
        isFeatured || isMedium
          ? 'shadow-lg hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/5'
          : 'shadow-md hover:shadow-xl'
      }`}
      style={{ animationDelay: `${Math.min(index * 0.06, 0.5)}s` }}
    >
      <img
        src={city.image}
        srcSet={srcSet}
        alt={city.name}
        className="w-full h-full object-cover md:transition-transform md:duration-700 md:ease-out md:group-hover:scale-105"
        width={isFeatured ? 800 : isMedium ? 600 : 400}
        height={isFeatured ? 380 : isMedium ? 340 : 280}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        sizes={isFeatured ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw' : isMedium ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      />
      {(() => {
        const status = evaluateCityRuleStatus(city).status;
        const badge = STATUS_BADGE_CONFIG[status];
        const StatusIcon = badge.icon;

        return (
          <div
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-20 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-2 backdrop-blur-md transition-transform duration-300 md:group-hover:scale-105 ${badge.containerClass}`}
            aria-label={`${city.name}: ${badge.label}`}
            title={`${city.name}: ${badge.label}`}
          >
            <StatusIcon size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px] drop-shadow-sm" />
          </div>
        );
      })()}
      <div className={`absolute inset-0 flex flex-col justify-end p-5 sm:p-6 lg:p-8 text-white ${
        isFeatured || isMedium
          ? 'bg-gradient-to-t from-black/90 via-black/25 to-transparent'
          : 'bg-gradient-to-t from-black/85 via-black/40 to-transparent'
      }`}>
        <div className="flex items-center gap-2 text-sky-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.25em] mb-2 sm:mb-3 drop-shadow-lg">
          <MapPin size={isFeatured ? 16 : 14} className="sm:w-4 sm:h-4" />
          <span>Ontdek {city.name}</span>
        </div>
        <h3 className={`font-black mb-2 sm:mb-3 flex items-center justify-between tracking-tighter drop-shadow-lg ${
          isFeatured ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl'
        }`}>
          {city.name}
          <div className="bg-white/10 backdrop-blur-2xl p-2 sm:p-2.5 lg:p-3 rounded-full md:transition-all md:duration-300 md:group-hover:bg-sky-600 md:group-hover:animate-arrow-salvo shadow-xl flex-shrink-0">
            <ArrowRight size={isFeatured ? 22 : 18} strokeWidth={3} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
        </h3>
        <p className={`text-slate-100 font-medium leading-relaxed opacity-95 drop-shadow-md ${
          isFeatured ? 'text-sm lg:text-base line-clamp-2' : 'text-xs sm:text-sm line-clamp-2'
        }`}>
          {city.description}
        </p>
      </div>
    </Link>
  );
};

// Rij-component met dynamische hover-swap animatie
// Op desktop hover: hovered kaart groeit vloeiend, andere krimpt
const HoverRow: React.FC<{ cities: City[], defaultFlexes: number[], isThreeItems: boolean, rowIndex: number }> = ({ cities, defaultFlexes, isThreeItems, rowIndex }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Zorg dat ze op mobiel stacken (flex-col), en op tablet/desktop naast elkaar (flex-row)
  // Voor 3 items gebruiken we lg:flex-row zodat ze niet te smal worden op tablet
  return (
    <div className={`flex flex-col ${isThreeItems ? 'lg:flex-row' : 'sm:flex-row'} gap-3 sm:gap-4 lg:gap-5 mb-3 sm:mb-4 lg:mb-5`}>
      {cities.map((city, i) => {
        const defaultFlex = defaultFlexes[i];
        let activeFlex;
        if (hoveredIdx === null) {
          activeFlex = defaultFlex;
        } else {
          // Minder extreme verhoudingen voor de 3-items rij om overflow van lange gemeentenamen te voorkomen
          if (isThreeItems) {
            activeFlex = hoveredIdx === i ? 3 : 2;
          } else {
            activeFlex = hoveredIdx === i ? 4 : 2;
          }
        }
        // Vanaf flex-waarde 3 tonen we de 'featured' text states (scale, opacity)
        const isFeatured = activeFlex >= 3;

        const srcSet = getResponsiveSrcSet(city.image);
        const status = evaluateCityRuleStatus(city).status;
        const badge = STATUS_BADGE_CONFIG[status];
        const StatusIcon = badge.icon;

        return (
          <Link
            key={city.slug}
            to={`/${city.slug}`}
            className={`city-card group relative rounded-2xl lg:rounded-3xl overflow-hidden block bg-slate-100 active:scale-[0.98] h-[280px] sm:h-[300px] lg:h-[380px] w-full ${isThreeItems ? 'lg:w-auto lg:flex-[var(--dynamic-flex)_1_0%]' : 'sm:w-auto sm:flex-[var(--dynamic-flex)_1_0%]'} ${
              isFeatured
                ? 'shadow-lg hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/5'
                : 'shadow-md hover:shadow-xl'
            }`}
            style={{
              '--dynamic-flex': activeFlex,
              contain: 'paint layout', // Isoleert de layout-berekeningen voor meer performantie
              willChange: 'flex, transform', // Hint voor de rendering engine
              transition: 'flex 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease-out',
              animationDelay: `${(rowIndex * cities.length + i) * 0.04}s`
            } as React.CSSProperties}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <img
              src={city.image}
              srcSet={srcSet}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out md:group-hover:scale-105"
              width={800}
              height={380}
              loading={rowIndex === 0 && i < 2 ? "eager" : "lazy"}
              decoding="async"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-20 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-2 backdrop-blur-md transform-gpu transition-transform duration-300 md:group-hover:scale-105 ${badge.containerClass}`}
              aria-label={`${city.name}: ${badge.label}`}
              title={`${city.name}: ${badge.label}`}
            >
              <StatusIcon size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px] drop-shadow-sm" />
            </div>
            {/* Statische gradient ipv animerende classes bespaart repaints */}
            <div className={`absolute inset-0 flex flex-col justify-end p-5 sm:p-6 lg:p-8 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent`}>
              <div className="flex items-center gap-2 text-sky-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.25em] mb-2 sm:mb-3 drop-shadow-lg">
                <MapPin size={14} className="sm:w-4 sm:h-4" />
                <span>Ontdek {city.name}</span>
              </div>
              
              {/* Container die niét schaalt, voorkomt dat de knop rechts buiten beeld gaat */}
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                {/* Animatie via hardware-versnelde scale gekoppeld enkel aan tekst */}
                <h3 className={`font-black tracking-tighter drop-shadow-lg text-2xl sm:text-3xl lg:text-4xl origin-bottom-left transform-gpu transition-all duration-500 ease-out will-change-transform ${
                  isFeatured ? 'scale-100 sm:scale-105' : 'scale-90 sm:scale-95'
                }`}>
                  {city.name}
                </h3>
                
                {/* Animatie van de volledige houder, niet enkel de pijl */}
                <div className="bg-white/10 backdrop-blur-2xl p-2 sm:p-2.5 lg:p-3 rounded-full transform-gpu transition-all duration-300 md:group-hover:bg-sky-600 md:group-hover:animate-arrow-salvo shadow-xl flex-shrink-0">
                  <ArrowRight size={18} strokeWidth={3} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              
              {/* Animatie via transform/opacity ipv line-clamp height reflows */}
              <p className={`text-slate-100 font-medium leading-relaxed drop-shadow-md text-xs sm:text-sm line-clamp-2 transform-gpu transition-all duration-500 ease-out ${
                isFeatured ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-90'
              }`}>
                {city.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(!!initialSearch);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Determine once at mount whether the prerender hero div exists in the DOM.
  // Using lazy initialization avoids calling setState inside useLayoutEffect,
  // which would trigger a synchronous re-render and force a layout recalculation.
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useSEO(SEO_DATA.home);

  // Ensure the page always starts at the top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero ref (kept for potential future parallax / measurements)
  const heroRef = useRef<HTMLDivElement>(null);

  // On mount, hide the static hero-prerender div from index.html so it doesn't
  // double up with the React-rendered hero image. The prerender div exists only
  // to give the browser an instant LCP element before React hydrates.
  useLayoutEffect(() => {
    const prerender = document.getElementById('hero-prerender');
    if (prerender) prerender.style.display = 'none';
    return () => {
      // Restore on unmount so future remounts still benefit from instant paint.
      if (prerender) prerender.style.display = '';
    };
  }, []);

  // Scroll to results section
  const scrollToResults = () => {
    const stedenSection = document.getElementById('steden');
    if (stedenSection) {
      stedenSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg('Geolocatie wordt niet ondersteund door je browser');
      return;
    }

    setIsLocating(true);
    setLocationMsg(null);
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
          setLocationMsg('Geen kuststad gevonden in de buurt');
        }
        setIsLocating(false);
      },
      (_error) => {
        setLocationMsg('Kon je locatie niet bepalen. Controleer of je locatietoegang hebt toegestaan.');
        setIsLocating(false);
      }
    );
  };

  const filteredCities = useMemo(() => {
    const filtered = CITIES.filter((city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Sorteer op kustlijn volgorde (NO → ZW)
    return [...filtered].sort((a, b) => {
      const idxA = COASTLINE_ORDER.indexOf(a.slug);
      const idxB = COASTLINE_ORDER.indexOf(b.slug);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [searchQuery]);

  // Toon speciale layouts alleen als alle steden zichtbaar zijn (geen filter)
  const isFullView = searchQuery.trim() === '' && filteredCities.length === COASTLINE_ORDER.length;

  const fullViewRows = useMemo(() => {
    if (!isFullView) return [];
    const ROW_CONFIGS = [
      { count: 2, flexes: [2, 4] },
      { count: 2, flexes: [4, 2] },
      { count: 2, flexes: [2, 4] },
      { count: 2, flexes: [4, 2] },
      { count: 3, flexes: [2, 2, 2] }
    ];
    const rows = [];
    let idx = 0;
    for (const config of ROW_CONFIGS) {
      if (idx >= filteredCities.length) break;
      rows.push({
        cities: filteredCities.slice(idx, idx + config.count),
        flexes: config.flexes
      });
      idx += config.count;
    }
    return rows;
  }, [filteredCities, isFullView]);

  // Create suggestions list (limit to 6 for better UX)
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length === 0) return [];
    return filteredCities.slice(0, 6);
  }, [filteredCities, searchQuery]);

  // Calculate dropdown position based on searchbar rect
  const updateDropdownPosition = useCallback(() => {
    if (searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (showSuggestions) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, { passive: true });
      window.addEventListener('resize', updateDropdownPosition, { passive: true });
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [showSuggestions, updateDropdownPosition]);

  // Handle clicks outside of search to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const inSearchBar = searchContainerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inSearchBar && !inDropdown) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSuggestionClick = (city: City) => {
    setSearchQuery(city.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    // Kort moment zodat de naam zichtbaar is in de searchbar vóór navigatie
    setTimeout(() => navigate(`/${city.slug}`), 120);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        scrollToResults();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
          // Scroll suggestion into view
          setTimeout(() => {
            document.getElementById(`suggestion-${newIndex}`)?.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth'
            });
          }, 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : -1;
          if (newIndex >= 0) {
            setTimeout(() => {
              document.getElementById(`suggestion-${newIndex}`)?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
              });
            }, 0);
          }
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else if (suggestions.length === 1) {
          handleSuggestionClick(suggestions[0]);
        } else {
          setShowSuggestions(false);
          scrollToResults();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  return (
    <div>
      {/* Hero Section with Dynamic Background */}
      <div ref={heroRef} data-header-hero="light" className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pt-20 sm:pt-24 pb-32 sm:pb-40 md:pb-48 overflow-hidden bg-slate-900">
        {/* ALWAYS render the hero image as a guaranteed fallback. The prerender hero from index.html
            (when present) is moved on top of this for parallax. If the prerender div is missing
            for any reason (cache, SW, prerender script change), this keeps the dark image visible
            so the white hero text stays readable. */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img
            src="/lexi.webp"
            srcSet="/lexi-mobile.webp 800w, /lexi.webp 1920w"
            sizes="100vw"
            alt="Hond aan het strand"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
            width={1920}
            height={1080}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-slate-950/28"></div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-50/78 via-slate-900/6 to-slate-900/18"></div>

        <div className="max-w-7xl mx-auto relative z-20 text-center safe-area-left safe-area-right overflow-hidden px-2">
          <h1 className="text-[1.7rem] sm:text-4xl md:text-6xl lg:text-7xl xl:text-[6.5rem] font-bold text-white mb-6 sm:mb-8 leading-[1.15] max-w-5xl mx-auto px-2 font-heading" style={{ textShadow: '0 2px 10px rgba(2,6,23,0.22)', letterSpacing: '-0.5px', fontWeight: 700, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            Met je hond naar zee? <br className="hidden sm:block" />
            <span className="text-sky-300 relative inline-block max-w-full">
              Wij weten precies
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-4 left-0 w-full h-3 sm:h-4 text-sky-300/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span> waar het mag.
          </h1>

          <p className="text-slate-100 max-w-3xl mx-auto leading-relaxed px-4 mb-10 sm:mb-14 text-sm sm:text-base md:text-lg" style={{ textShadow: '0 1px 6px rgba(2,6,23,0.18)', fontWeight: 400 }}>
            Nooit meer gissen naar strandregels. Ontdek actuele toegankelijkheid,{' '}
            <span className="text-white font-semibold">verborgen losloopweides</span> en de meest gastvrije hotspots voor jou en je viervoeter.
          </p>

          <div ref={searchContainerRef} className="max-w-lg md:max-w-3xl mx-auto relative px-2 sm:px-4 md:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div ref={searchBarRef} className="search-container focus-ring flex items-center bg-white rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-white/50 p-1.5 sm:p-2 focus-within:border-sky-500">
              <div className="pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
                <Search size={20} className="search-icon text-slate-400 sm:w-[22px] sm:h-[22px]" />
              </div>
              <input
                type="text"
                placeholder="Waar gaan jullie wandelen?"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.trim().length > 0);
                  setSelectedSuggestionIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="search-input flex-1 px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 bg-transparent text-base sm:text-lg md:text-xl text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none font-heading min-w-0"
                aria-label="Zoek een kuststad"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-controls="search-suggestions"
                aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                  }}
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

            {/* Autocomplete Suggestions Dropdown – rendered via portal to escape overflow:hidden */}
            {showSuggestions && suggestions.length > 0 && createPortal(
              <div 
                id="search-suggestions"
                style={{
                  ...dropdownStyle,
                  maxHeight: 'min(400px, 50vh)',
                  WebkitOverflowScrolling: 'touch' as const,
                }}
                ref={dropdownRef}
                className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="overflow-y-auto max-h-full overscroll-contain">
                  {suggestions.map((city, index) => (
                    <button
                      key={city.slug}
                      id={`suggestion-${index}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(city);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(city);
                      }}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left transition-all duration-150 active:scale-[0.98] ${
                        index === selectedSuggestionIndex 
                          ? 'bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700' 
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      } ${index === suggestions.length - 1 ? '' : 'border-b border-slate-100'}`}
                      style={{ minHeight: '60px' }}
                    >
                      <div className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
                        index === selectedSuggestionIndex ? 'bg-sky-100' : 'bg-slate-50'
                      }`}>
                        <MapPin 
                          size={20} 
                          className={`${
                            index === selectedSuggestionIndex ? 'text-sky-600' : 'text-slate-500'
                          }`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-base sm:text-lg block">{city.name}</span>
                        <span className="text-xs text-slate-500 line-clamp-1">{city.description}</span>
                      </div>
                      <ArrowRight 
                        size={20} 
                        className={`ml-auto flex-shrink-0 transition-transform ${
                          index === selectedSuggestionIndex ? 'text-sky-600 translate-x-1' : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}

            {locationMsg && (
              <div className="mt-4 bg-white/95 backdrop-blur-sm text-slate-700 text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
                <span>{locationMsg}</span>
                <button onClick={() => setLocationMsg(null)} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Sluiten">
                  <X size={16} />
                </button>
              </div>
            )}

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
                >
                  {pop}
                </button>
              ))}
            </div>
            
            {/* Kaart CTA Button */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Link
                to="/kaart"
                className="group inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/40 hover:bg-white hover:border-white text-white hover:text-sky-700 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-heading transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 touch-target"
              >
                <MapPin size={20} className="sm:w-[22px] sm:h-[22px] transition-transform group-hover:scale-110" />
                <span>Bekijk interactieve kaart</span>
                <ArrowRight size={18} className="sm:w-[20px] sm:h-[20px] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Organic Wave Divider with Infinite Animation */}
        <div className="absolute -bottom-3 left-0 w-full overflow-hidden leading-[0] z-10">
          <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-stone-50"
              />
            </svg>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
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
            <div className="hidden sm:block text-sm font-bold text-slate-500 uppercase tracking-widest">
              Totaal: {filteredCities.length} resultaten
            </div>
          </div>

          {filteredCities.length > 0 ? (
            <>
              {isFullView ? (
                <div className="flex flex-col">
                  {fullViewRows.map((row, index) => (
                    <HoverRow key={index} cities={row.cities} defaultFlexes={row.flexes} isThreeItems={row.flexes.length === 3} rowIndex={index} />
                  ))}
                </div>
              ) : (
                <div className={
                  filteredCities.length >= 5
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
                }>
                  {filteredCities.map((city, index) => (
                    <CityCard key={city.slug} city={city} index={index} total={filteredCities.length} />
                  ))}
                </div>
              )}
            </>
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

      <section className="bg-stone-50 pb-12 sm:pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
              <div className="flex h-full flex-col justify-between gap-8 p-6 lg:p-8">
                <div className="max-w-3xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
                    <Users size={14} />
                    Lokaal meehelpen
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Help mee de kust veilig te houden voor elke hond
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                    Voor het <strong className="font-black text-slate-900">meldpunt</strong> zoeken we in elke kustgemeente mensen die hun buurt goed kennen en willen meehelpen wanneer er meldingen binnenkomen over gif, verdachte stoffen of andere risico&apos;s.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    to="/meldpunt/vrijwilligers"
                    className="inline-flex self-start items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-sky-700"
                  >
                    <Users size={18} />
                    Ontdek hoe jij helpt
                  </Link>
                  <p className="text-xs font-medium text-slate-500">
                    Ontdek of dit iets voor jou is.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-sky-50 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
              <div className="flex h-full flex-col justify-between gap-8 p-6 lg:p-8">
                <div className="max-w-3xl xl:ml-auto xl:text-right">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 lg:ml-auto">
                    <Megaphone size={14} />
                    Meld jouw zaak aan
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Krijg meer hondenbaasjes over de vloer in jouw zaak
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                    Dan kan je <strong className="font-black text-slate-900">gratis</strong> vermeld worden op HondAanZee.be. Zo zien hondeneigenaars meteen dat ze welkom zijn bij jou, en kan je ook een sticker aanvragen voor je zaak.
                  </p>
                </div>

                <div className="order-2 flex flex-col gap-3 xl:items-end">
                  <Link
                    to="/zaak-aanmelden"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-600"
                  >
                    <Megaphone size={18} />
                    Meld je zaak GRATIS aan
                  </Link>
                  <p className="text-xs font-medium text-slate-500 xl:text-right">
                    Bekijk eerst de voordelen voor jouw zaak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section — visible for users + crawlable for AI */}
      <section className="bg-stone-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-center mb-2">
            Veelgestelde Vragen
          </h2>
          <p className="text-slate-500 text-center text-sm sm:text-base mb-10">Concrete antwoorden — gebaseerd op de regels per kustgemeente</p>
          <div className="space-y-3">
            {[
              {
                q: 'Wanneer mogen honden op het strand? Wat zijn de exacte data?',
                a: 'De winterregeling (honden wél toegelaten op het strand) loopt in de meeste kustgemeenten van 1 of 16 oktober tot 14 of 31 maart. In de zomer zijn honden verboden op bewaakte stranden, meestal van 10:00 tot 20:00. Maar: er zijn uitzonderingen. Blankenberge heeft Zone West waar honden het héle jaar welkom zijn, ook in de zomer. De Haan staat honden toe op de onbewaakte stranden, 365 dagen per jaar. Knokke-Heist heeft een 24/7 losloopzone aan het Zwin. Bekijk op onze stadspagina\'s de exacte regels voor jouw bestemming — ze verschillen écht per gemeente.'
              },
              {
                q: 'Hoeveel losloopzones zijn er aan de kust en waar vind ik ze?',
                a: 'We hebben 28 losloopzones en hondenweides in kaart gebracht, verspreid over de hele kustlijn. Oostende springt eruit met 8 zones, waaronder het Schorrepark (5 sterren — met vijvers, bunkers en heuvels) en het Hondenbos van 3,5 hectare. De Haan en Wenduine hebben samen 5 zones, waarvan de Duinbossen-zone van 1,2 hectare de meest geliefde is. Elke zone op onze website bevat GPS-coördinaten, een beoordeling, parkeertips en of het terrein omheind is.'
              },
              {
                q: 'Waar vind ik een dierenarts aan de kust — ook in het weekend of bij nood?',
                a: 'We lijsten 14 dierenartspraktijken aan de volledige Belgische kust, van Knokke tot De Panne. Voor spoedgevallen buiten de openingsuren: AniCura in Oudenburg is elke dag open van 7:30 tot 21:00 en behandelt spoedgevallen. Tijdens kantooruren kun je bij o.a. Dierenarts Frederik Galle (Oostende), De Praktijk 227 (Blankenberge) of Dierenarts Elise Buyse (Nieuwpoort) terecht. Het volledige overzicht met telefoonnummers en specialisaties vind je op onze dienstenpagina.'
              },
              {
                q: 'Welke hondvriendelijke restaurants en cafés moet ik kennen?',
                a: 'We hebben 50+ hondvriendelijke horecazaken gecheckt langs de kust. Een paar opvallende: Siesta Bar in Knokke heeft een speciaal hondenmenu inclusief "hondenbier". Lakaiann in Blankenberge is een unieke koffiebar met kristalwinkel waar je hond een waterbak en snacks krijgt. De Frietboetiek in Middelkerke legt een dekentje op de bank voor je hond. En Madam Caravan in Middelkerke won een award in 2024 en serveert alles homemade, ook op het terras met je viervoeter erbij. Bekijk alle hotspots per badstad.'
              },
              {
                q: 'Zijn er hondenevenementen aan de Belgische kust?',
                a: 'Ja, jaarlijks worden er meerdere grote hondenfestivals georganiseerd. Het Kwispelfestival in De Panne (17 mei 2026) is gratis en biedt kustwandelingen, workshops en professionele hondenfotografie. Het Groot Oostends Hondenfestival (23-24 mei 2026) vindt plaats op een terrein van 12.000 m² met losloopzone, demonstraties en gratis parking. En de Grote Hondenwandeling Bredene (24 mei 2026) gaat door de duinen en over het strand, voor €5 deelname. Alle details vind je op onze agendapagina.'
              },
              {
                q: 'Wat is het verschil tussen de zomer- en winterregeling per gemeente?',
                a: 'Het verschil is groot. In de winter (grofweg oktober–maart) mogen honden in bijna alle kustgemeenten vrij op het strand, vaak zelfs los. In de zomer (april–september) gelden er strikte tijdsvensters: op bewaakte stranden zijn honden doorgaans verboden tussen 10:00 en 20:00. Buiten die uren mag het in sommige gemeentes wél, maar aan de leiband. Belangrijk: elke gemeente hanteert andere data. Bredene laat ze los in de winter op strand én duinen. Knokke-Heist is juist het strengst met boetes tot €350. Wij tonen de exacte regels per stad zodat je niet voor verrassingen staat.'
              },
              {
                q: 'Kan ik mijn hondvriendelijke zaak aanmelden op hondaanzee.be?',
                a: 'Absoluut — en het is gratis. Vandaag staan er al 132 hondvriendelijke horeca-, verblijf- en winkelzaken én 24 dienstverleners (dierenartsen en dierenspeciaalzaken) op de gids, verspreid over alle 11 kustgemeenten van De Panne tot Knokke-Heist. 54 daarvan dragen het Aanrader-label en 72 zaken hebben de officiële HondAanZee-sticker aan hun deur. Heb je een café, restaurant, hotel, vakantiewoning, winkel of dienst waar honden écht welkom zijn? Meld je aan via /zaak-aanmelden — we checken elke aanmelding persoonlijk, schrijven een eerlijke beschrijving en zorgen voor je eigen detailpagina met foto en route, volledig gratis.'
              }
            ].map(({ q, a }, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={q} className="relative">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className={`w-full flex items-center justify-between text-left gap-4 px-5 py-4 sm:px-7 sm:py-5 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-sm ${
                      isOpen
                        ? 'bg-white/80 border-sky-200 shadow-sky-100/60 shadow-lg ring-1 ring-sky-100'
                        : 'bg-white/60 border-white/80 hover:bg-white/90 hover:border-sky-100 hover:shadow-md'
                    }`}
                    style={{
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      background: isOpen
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,249,255,0.88) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.65) 100%)',
                    }}
                  >
                    <span className={`font-bold text-base sm:text-lg transition-colors duration-200 ${isOpen ? 'text-sky-700' : 'text-slate-800'}`}>{q}</span>
                    <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${
                      isOpen
                        ? 'bg-sky-500 border-sky-400 shadow-md shadow-sky-200'
                        : 'bg-white/80 border-slate-200'
                    }`}>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400'}`}
                      />
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="mx-1 mb-1 rounded-b-2xl border border-t-0 border-sky-100 bg-white/70 backdrop-blur-md px-5 pb-5 pt-4 sm:px-7"
                      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                    >
                      <p className="text-slate-600 leading-relaxed text-[15px]">{a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
