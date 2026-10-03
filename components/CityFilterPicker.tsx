import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';

interface CityFilterPickerProps {
  cities: { slug: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onOpen?: () => void;
}

const CityFilterPicker: React.FC<CityFilterPickerProps> = ({ cities, selected, onChange, onOpen }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [placement, setPlacement] = useState({ above: false, maxHeight: 480 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const label = selected.length === 0
    ? 'Alle gemeenten'
    : selected.length === 1
      ? cities.find(city => city.slug === selected[0])?.name || '1 gemeente'
      : `${selected.length} gemeenten`;
  const matches = cities.filter(city => city.name.toLocaleLowerCase('nl').includes(query.trim().toLocaleLowerCase('nl')));

  useLayoutEffect(() => {
    if (!open) return;
    const positionMenu = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const placeAbove = below < 280 && above > below;
      setPlacement({ above: placeAbove, maxHeight: Math.max(160, Math.min(480, placeAbove ? above : below)) });
    };
    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Gemeente: ${label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (!open) { setQuery(''); onOpen?.(); }
          setOpen(!open);
        }}
        className={`flex h-12 w-full items-center gap-2.5 rounded-lg border bg-white px-3.5 text-left text-sm font-medium transition-colors ${selected.length ? 'border-sky-300 text-sky-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
      >
        <MapPin size={17} className="shrink-0 text-sky-600" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div id={id} role="dialog" aria-label="Gemeenten kiezen" style={{ maxHeight: placement.maxHeight }} className={`absolute right-0 z-[60] flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 sm:w-80 ${placement.above ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'}`}>
          <div className="mb-3 flex min-h-9 shrink-0 items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900">Gemeenten</span>
            {selected.length > 0 && <button type="button" onClick={() => onChange([])} className="min-h-9 px-1 text-xs font-medium text-sky-700 hover:text-sky-900">Wis selectie</button>}
          </div>
          <label className="mb-2 flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
            <input ref={searchRef} type="search" aria-label="Zoek een gemeente" placeholder="Zoek een gemeente…" value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" />
          </label>
          <p className="mb-2 shrink-0 px-1 text-xs text-slate-500">Je kunt meerdere gemeenten kiezen.</p>
          <fieldset className="min-h-0 overflow-y-auto overscroll-contain">
            <legend className="sr-only">Kies gemeenten</legend>
            {matches.map(city => (
              <label key={city.slug} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${selected.includes(city.slug) ? 'bg-sky-50 text-sky-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                <input type="checkbox" checked={selected.includes(city.slug)} onChange={() => onChange(selected.includes(city.slug) ? selected.filter(slug => slug !== city.slug) : [...selected, city.slug])} className="h-4 w-4 shrink-0 accent-sky-600" />
                <span>{city.name}</span>
              </label>
            ))}
            {matches.length === 0 && <p role="status" className="px-2.5 py-4 text-sm text-slate-500">Geen gemeente gevonden.</p>}
          </fieldset>
        </div>
      )}
    </div>
  );
};

export default CityFilterPicker;
