import SavePlaceButton from '../components/member/SavePlaceButton.tsx';
import HotspotSocialSummary from '../components/places/HotspotSocialSummary.tsx';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Coffee, Utensils, Bed, ShoppingBag, Wine, Beer, Star, MapPin, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { HOTSPOTS } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import { getHotspotDetailPath } from '../utils/placeRoutes.ts';
import DirectoryHero from '../components/DirectoryHero.tsx';
import PlaceDirectory from '../components/PlaceDirectory.tsx';
import CityFilterPicker from '../components/CityFilterPicker.tsx';
import { buildHotspotFilterParams, readHotspotFilters } from '../utils/hotspotFilters.ts';

const INITIAL_SHOW = 12;
const SEARCH_SUGGESTION_LIMIT = 6;

const AllHotspots: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Apply SEO metadata. When filters are active we mark the URL noindex so
  // permutations don't dilute crawl budget; the canonical still points at /hotspots.
  const hasActiveFilters = searchParams.getAll('city').some(city => city !== 'all')
    || searchParams.getAll('type').some(type => type !== 'all')
    || Boolean(searchParams.get('q'));
  useSEO({ ...SEO_DATA.hotspots, noindex: hasActiveFilters });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Café': return <Beer size={14} />;
      case 'Koffiebar': return <Coffee size={14} />;
      case 'Restaurant': return <Utensils size={14} />;
      case 'Brasserie': return <Wine size={14} />;
      case 'Slapen': return <Bed size={14} />;
      case 'Shoppen': return <ShoppingBag size={14} />;
      default: return <Star size={14} />;
    }
  };

  const types = useMemo(() => ['Koffiebar', 'Restaurant', 'Café', 'Brasserie', 'Slapen', 'Shoppen']
    .filter(type => HOTSPOTS.some(spot => spot.type === type)), []);
  const citiesWithHotspots = useMemo(() => {
    const citySet = new Set(HOTSPOTS.map(spot => spot.city));
    return CITIES.filter(city => citySet.has(city.slug));
  }, []);

  const validCitySet = useMemo(() => new Set(citiesWithHotspots.map((city) => city.slug)), [citiesWithHotspots]);
  const validTypeSet = useMemo(() => new Set(types), [types]);

  const { cities: selectedCities, types: selectedTypes, query: selectedQuery } = useMemo(
    () => readHotspotFilters(searchParams, validCitySet, validTypeSet),
    [searchParams, validCitySet, validTypeSet],
  );
  const cityKey = selectedCities.join('|');
  const typeKey = selectedTypes.join('|');

  useEffect(() => {
    setSearchQuery(selectedQuery);
  }, [selectedQuery]);

  const buildFilterSearch = (cities: string[], types: string[], query: string = searchQuery) => {
    const next = buildHotspotFilterParams({ cities, types, query });
    const nextQuery = next.toString();
    return nextQuery ? `?${nextQuery}` : '';
  };

  const updateSearchParams = (cities: string[], types: string[], query: string) => {
    setSearchParams(buildHotspotFilterParams({ cities, types, query }), { replace: false });
  };

  const rememberFilters = () => {
    const from = `${location.pathname}${buildFilterSearch(selectedCities, selectedTypes)}${location.hash}`;
    if (from !== `${location.pathname}${location.search}${location.hash}`) {
      navigate(from, { replace: true });
    }
    return from;
  };

  // Keep typed searches shareable without adding a history entry for each letter.
  useEffect(() => {
    if (searchQuery.trim() === selectedQuery) return;
    const timer = window.setTimeout(() => {
      setSearchParams(current => {
        const next = new URLSearchParams(current);
        if (searchQuery.trim()) next.set('q', searchQuery.trim());
        else next.delete('q');
        return next;
      }, { replace: true });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery, selectedQuery, setSearchParams]);

  // Reset show-all when filters change
  useEffect(() => {
    setShowAll(false);
  }, [cityKey, typeKey, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!searchContainerRef.current?.contains(target)) {
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

  const baseFilteredHotspots = useMemo(() => {
    return HOTSPOTS.filter((spot) => {
      const cityMatch = selectedCities.length === 0 || selectedCities.includes(spot.city);
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(spot.type);
      return cityMatch && typeMatch;
    });
  }, [selectedCities, selectedTypes]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return [...baseFilteredHotspots]
      .filter((spot) => spot.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aExact = aName === query ? 1 : 0;
        const bExact = bName === query ? 1 : 0;
        if (bExact !== aExact) return bExact - aExact;
        const aStarts = aName.startsWith(query) ? 1 : 0;
        const bStarts = bName.startsWith(query) ? 1 : 0;
        if (bStarts !== aStarts) return bStarts - aStarts;
        const aRecommended = a.tags.includes('Aanrader') ? 1 : 0;
        const bRecommended = b.tags.includes('Aanrader') ? 1 : 0;
        if (bRecommended !== aRecommended) return bRecommended - aRecommended;
        return a.name.localeCompare(b.name, 'nl');
      })
      .slice(0, SEARCH_SUGGESTION_LIMIT);
  }, [baseFilteredHotspots, searchQuery]);

  const handleSuggestionClick = (spot: typeof HOTSPOTS[number]) => {
    const from = rememberFilters();
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    navigate(getHotspotDetailPath(spot), {
      state: {
        from,
      },
    });
  };

  const submitSearch = (query: string) => {
    updateSearchParams(selectedCities, selectedTypes, query);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitSearch(searchQuery);
      }
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          submitSearch(searchQuery);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const filteredHotspots = useMemo(() => {
    return baseFilteredHotspots
      .filter((spot) => !normalizedSearch || spot.name.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => {
        const aIsAanrader = a.tags.includes('Aanrader') ? 1 : 0;
        const bIsAanrader = b.tags.includes('Aanrader') ? 1 : 0;
        return bIsAanrader - aIsAanrader;
      });
  }, [baseFilteredHotspots, normalizedSearch]);

  const getCityName = (slug: string) => {
    return CITIES.find(city => city.slug === slug)?.name || slug;
  };

  const hasFilters = selectedCities.length > 0 || selectedTypes.length > 0 || normalizedSearch.length > 0;
  const resetFilters = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    updateSearchParams([], [], '');
  };

  return (
    <div className="animate-in fade-in overflow-x-hidden">
      <DirectoryHero kind="hotspots" count={HOTSPOTS.length} />

      <div className="site-shell pb-8 pt-2 sm:pb-12 sm:pt-4 md:pb-16">
        <section id="hotspot-filters" aria-label="Hotspots zoeken en filteren" data-hotspot-filters className="relative mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:mb-8 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]">
            <div
              ref={searchContainerRef}
              className="relative min-w-0"
              onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setShowSuggestions(false);
                  setSelectedSuggestionIndex(-1);
                }
              }}
            >
              <label htmlFor="hotspot-search" className="sr-only">Zoek een hotspot op naam</label>
              <div className="flex h-12 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                <Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="hotspot-search"
                  type="search"
                  value={searchQuery}
                  onChange={event => {
                    const nextValue = event.target.value;
                    setSearchQuery(nextValue);
                    setShowSuggestions(nextValue.trim().length > 0);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowSuggestions(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Zoek een hotspot op naam…"
                  autoComplete="off"
                  spellCheck="false"
                  className="min-w-0 flex-1 bg-transparent text-base font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions && suggestions.length > 0}
                  aria-controls={showSuggestions && suggestions.length > 0 ? 'hotspot-search-suggestions' : undefined}
                  aria-activedescendant={showSuggestions && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length ? `hotspot-suggestion-${selectedSuggestionIndex}` : undefined}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                      updateSearchParams(selectedCities, selectedTypes, '');
                    }}
                    className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700"
                    aria-label="Wis zoekopdracht"
                  >
                    <X size={17} aria-hidden="true" />
                  </button>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div id="hotspot-search-suggestions" role="listbox" aria-label="Gevonden hotspots" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-[min(28rem,55vh)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                  {suggestions.map((spot, index) => (
                    <Link
                      key={spot.id}
                      id={`hotspot-suggestion-${index}`}
                      to={getHotspotDetailPath(spot)}
                      role="option"
                      aria-selected={index === selectedSuggestionIndex}
                      onMouseDown={event => event.preventDefault()}
                      onClick={event => {
                        event.preventDefault();
                        handleSuggestionClick(spot);
                      }}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${index === selectedSuggestionIndex ? 'bg-sky-50 text-sky-800' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sky-600" aria-hidden="true">{getIcon(spot.type)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{spot.name}</span>
                        <span className="block truncate text-xs text-slate-500">{getCityName(spot.city)} · {spot.type}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <CityFilterPicker
              cities={citiesWithHotspots}
              selected={selectedCities}
              onChange={cities => updateSearchParams(cities, selectedTypes, searchQuery)}
              onOpen={() => { setShowSuggestions(false); setSelectedSuggestionIndex(-1); }}
            />
          </div>

          <fieldset className="mt-3">
            <legend className="sr-only">Type hotspot — je kunt meerdere types kiezen</legend>
            <div className="flex flex-wrap gap-2">
              {types.map(type => {
                const selected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                      updateSearchParams(selectedCities, selected ? selectedTypes.filter(value => value !== type) : [...selectedTypes, type], searchQuery);
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors sm:min-h-10 ${selected ? 'border-sky-300 bg-sky-50 font-semibold text-sky-800' : 'border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <span aria-hidden="true">{selected ? <Check size={14} /> : getIcon(type)}</span>
                    {type}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {selectedCities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Geselecteerde gemeenten">
              {selectedCities.map(slug => (
                <button key={slug} type="button" aria-label={`Verwijder filter ${getCityName(slug)}`} onClick={() => updateSearchParams(selectedCities.filter(city => city !== slug), selectedTypes, searchQuery)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-100 sm:min-h-8">
                  {getCityName(slug)} <X size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex min-h-9 items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm font-medium text-slate-600" role="status" aria-live="polite" aria-atomic="true">
              <span className="font-semibold text-slate-900">{filteredHotspots.length}</span> {filteredHotspots.length === 1 ? 'hotspot' : 'hotspots'} gevonden
            </p>
            {hasFilters && <button type="button" onClick={resetFilters} className="flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-sky-700 transition-colors hover:text-sky-900 sm:min-h-8"><X size={14} aria-hidden="true" /> Wis filters</button>}
          </div>
        </section>

        {/* Hotspots Grid */}
        {filteredHotspots.length > 0 ? (
          <>
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-stretch">
            {(showAll ? filteredHotspots : filteredHotspots.slice(0, INITIAL_SHOW)).map((spot) => (
              <div key={spot.id} className="relative flex flex-col">
              <SavePlaceButton compact place={{ kind: 'hotspot', city_slug: spot.city, place_slug: spot.slug }} className="absolute right-3 top-14 z-10" />
              <Link
                to={getHotspotDetailPath(spot)}
                state={{ from: `${location.pathname}${buildFilterSearch(selectedCities, selectedTypes)}${location.hash}` }}
                onClick={() => { rememberFilters(); }}
                className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col"
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
                  <span className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-slate-900/90 backdrop-blur text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
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
                  <HotspotSocialSummary place={{city:spot.city,slug:spot.slug}}/>
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
                </div>
                </div>
              </Link>
              </div>
            ))}
          </div>

          {/* Show more / Show less button */}
          {filteredHotspots.length > INITIAL_SHOW && (
            <div className="flex justify-center mt-10 sm:mt-12">
              <button
                onClick={() => {
                  if (showAll && gridRef.current) {
                    gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setShowAll(!showAll);
                }}
                className="group flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-2 border-transparent hover:border-sky-200 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
              >
                {showAll ? (
                  <>
                    Toon minder
                    <ChevronUp size={18} className="transition-transform group-hover:-translate-y-0.5" />
                  </>
                ) : (
                  <>
                    Toon alle {filteredHotspots.length} hotspots
                    <ChevronDown size={18} className="transition-transform group-hover:translate-y-0.5" />
                  </>
                )}
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-16 sm:py-20 md:py-24">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16 max-w-2xl mx-auto">
              <div className="text-slate-300 mb-6">
                <Coffee size={48} className="mx-auto" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Geen hotspots gevonden
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Er zijn geen hotspots voor deze combinatie. Verwijder een filter of probeer een andere zoekterm.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors"
                >
                  <X size={16} /> Wis alle filters
                </button>
              )}
            </div>
          </div>
        )}
        {!hasActiveFilters && <PlaceDirectory kind="hotspot" />}
      </div>

    </div>
  );
};

export default AllHotspots;
