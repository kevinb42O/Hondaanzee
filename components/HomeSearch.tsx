import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Bed, Beer, Coffee, MapPin, PawPrint, Search, ShoppingBag, Stethoscope, Utensils, X } from 'lucide-react';
import type { SearchKind, SearchResult } from '../utils/search.ts';

export const SearchResultIcon = ({ kind, label, size = 20 }: { kind: SearchKind; label?: string; size?: number }) => {
  const Icon = kind === 'city' ? MapPin : kind === 'off-leash' ? PawPrint
    : label === 'Dierenarts' ? Stethoscope : label === 'Slapen' ? Bed
    : label === 'Shoppen' || label === 'Dierenspeciaalzaak' ? ShoppingBag
    : label === 'Koffiebar' ? Coffee : label === 'Café' ? Beer : Utensils;
  return <Icon size={size} aria-hidden="true" />;
};

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: boolean;
  onActivate: () => void;
  onSubmit: () => void;
  onSelect: (result: SearchResult) => void;
  onUseLocation: () => void;
  isLocating: boolean;
}

export default function HomeSearch({ query, onQueryChange, results, loading, error, onActivate, onSubmit, onSelect, onUseLocation, isLocating }: Props) {
  const id = useId();
  const listId = `${id}-suggestions`;
  const container = useRef<HTMLDivElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const suggestions = results.slice(0, 8);
  const visible = open && !!query.trim();

  useEffect(() => { setSelected(-1); }, [query]);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!container.current?.contains(target) && !dropdown.current?.contains(target)) {
        setOpen(false);
        setSelected(-1);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  useLayoutEffect(() => {
    if (!visible) return;
    const position = () => {
      const rect = container.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportBottom = window.visualViewport ? window.visualViewport.height + window.visualViewport.offsetTop : window.innerHeight;
      const below = viewportBottom - rect.bottom - 16;
      const above = rect.top - (window.visualViewport?.offsetTop || 0) - 16;
      const useAbove = below < 160 && above > below;
      setStyle({
        position: 'fixed', left: rect.left, width: rect.width, zIndex: 9999,
        top: useAbove ? undefined : rect.bottom + 8,
        bottom: useAbove ? window.innerHeight - rect.top + 8 : undefined,
        maxHeight: Math.max(100, Math.min(420, useAbove ? above : below)),
      });
    };
    position();
    window.addEventListener('scroll', position, { passive: true });
    window.addEventListener('resize', position);
    window.visualViewport?.addEventListener('resize', position);
    window.visualViewport?.addEventListener('scroll', position);
    return () => {
      window.removeEventListener('scroll', position);
      window.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('scroll', position);
    };
  }, [visible]);

  useEffect(() => {
    if (selected >= 0) document.getElementById(`${id}-option-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, selected]);

  const submit = () => { setOpen(false); setSelected(-1); onSubmit(); };
  const select = (result: SearchResult) => { setOpen(false); setSelected(-1); onSelect(result); };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { setOpen(false); setSelected(-1); return; }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (visible && selected >= 0 && suggestions[selected]) select(suggestions[selected]);
      else submit();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setSelected(previous => event.key === 'ArrowDown' ? Math.min(previous + 1, suggestions.length - 1) : Math.max(-1, previous - 1));
    }
  };

  return <>
    <div ref={container} className="search-container focus-ring flex items-center bg-white rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-white/50 p-1.5 sm:p-2 focus-within:border-sky-500">
      <Search size={20} aria-hidden="true" className="ml-3 sm:ml-5 shrink-0 text-slate-400" />
      <input
        ref={input} type="text" value={query} placeholder="Zoek een badstad, zaak of losloopzone"
        onChange={event => { onQueryChange(event.target.value); setOpen(true); setSelected(-1); }}
        onFocus={() => { onActivate(); setOpen(true); }}
        onBlur={event => { if (!dropdown.current?.contains(event.relatedTarget as Node)) { setOpen(false); setSelected(-1); } }}
        onKeyDown={handleKeyDown}
        className="search-input flex-1 min-w-0 px-2 sm:px-4 py-3 sm:py-4 md:py-5 bg-transparent text-base sm:text-lg md:text-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none font-heading"
        aria-label="Zoek een badstad, zaak of losloopzone" role="combobox" aria-autocomplete="list"
        aria-expanded={visible} aria-controls={visible ? listId : undefined}
        aria-activedescendant={visible && selected >= 0 && suggestions[selected] ? `${id}-option-${selected}` : undefined}
        enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck={false}
      />
      {query ? <button onClick={() => { onQueryChange(''); setOpen(false); setSelected(-1); input.current?.focus(); }} className="clear-btn p-2 text-slate-400 hover:text-slate-600 touch-target" aria-label="Wis zoekopdracht"><X size={20} /></button>
        : <button onClick={onUseLocation} disabled={isLocating} className={`p-2 mr-1 touch-target ${isLocating ? 'text-sky-400 animate-pulse' : 'text-slate-400 hover:text-sky-600'}`} aria-label="Gebruik mijn locatie" title="Vind dichtstbijzijnde badstad"><MapPin size={20} /></button>}
      <button onClick={submit} className="btn-lift bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-heading whitespace-nowrap touch-target">Zoeken</button>
    </div>
    {visible && createPortal(<div ref={dropdown} style={style} className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto overscroll-contain text-left">
      <div id={listId} role="listbox" aria-label="Zoeksuggesties" aria-busy={loading}>
        {suggestions.map((result, index) => <button
          key={result.id} id={`${id}-option-${index}`} role="option" aria-selected={selected === index} tabIndex={-1}
          onMouseDown={event => event.preventDefault()} onClick={() => select(result)} onMouseEnter={() => setSelected(index)}
          className={`w-full flex items-center gap-3 px-4 sm:px-6 py-4 text-left border-b border-slate-100 ${selected === index ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          <span className="shrink-0 rounded-xl p-2 bg-slate-50 text-sky-600"><SearchResultIcon kind={result.kind} label={result.label} /></span>
          <span className="flex-1 min-w-0"><span className="block font-bold text-base break-words">{result.name}</span><span className="block text-xs text-slate-500">{result.label}{result.kind !== 'city' && ` · ${result.cityName}`}{result.approximate && ' · Mogelijke match'}</span></span>
          <ArrowRight size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
        </button>)}
      </div>
      {!suggestions.length && <p role="status" className="px-5 py-4 text-sm text-slate-600">{loading ? 'Zoeken…' : error ? 'Zoeken kon niet geladen worden. Vernieuw de pagina om opnieuw te proberen.' : 'Geen resultaten. Probeer een andere naam, categorie of badstad.'}</p>}
      {suggestions.length > 0 && <button onMouseDown={event => event.preventDefault()} onClick={submit} className="w-full px-5 py-4 text-sm font-bold text-sky-700 hover:bg-sky-50 text-left">{results.length === 1 ? 'Bekijk 1 resultaat' : `Bekijk alle ${results.length} resultaten`} <ArrowRight size={16} className="inline ml-1" aria-hidden="true" /></button>}
    </div>, document.body)}
  </>;
}
