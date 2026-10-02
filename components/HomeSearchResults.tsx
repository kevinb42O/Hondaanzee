import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import type { SearchKind, SearchResult } from '../utils/search.ts';
import { SearchResultIcon } from './HomeSearch.tsx';

const FILTERS: { kind: SearchKind | 'all'; label: string }[] = [
  { kind: 'all', label: 'Alles' }, { kind: 'city', label: 'Badsteden' },
  { kind: 'hotspot', label: 'Hotspots' }, { kind: 'service', label: 'Diensten' }, { kind: 'off-leash', label: 'Losloopzones' },
];

export default function HomeSearchResults({ query, results, loading, error, onClear }: {
  query: string; results: SearchResult[]; loading: boolean; error: boolean; onClear: () => void;
}) {
  const [filter, setFilter] = useState<SearchKind | 'all'>('all');
  const visible = filter === 'all' ? results : results.filter(result => result.kind === filter);
  const from = `/?${new URLSearchParams({ search: query })}#steden`;
  return <div data-search-results>
    <div className="mb-6 px-2">
      <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Search size={24} className="text-sky-500 shrink-0" />Zoekresultaten</h2>
      <p className="mt-3 text-slate-600 break-words" role="status" aria-live="polite">{loading ? 'Zoeken…' : error ? 'Zoeken kon niet geladen worden. Vernieuw de pagina om opnieuw te proberen.' : `${visible.length} ${visible.length === 1 ? 'resultaat' : 'resultaten'} voor “${query}”`}</p>
    </div>
    {!loading && !error && <>
      <div className="flex flex-wrap gap-2 mb-6" aria-label="Filter zoekresultaten">
        {FILTERS.map(({ kind, label }) => {
          const count = kind === 'all' ? results.length : results.filter(result => result.kind === kind).length;
          return <button key={kind} aria-pressed={filter === kind} onClick={() => setFilter(kind)} className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${filter === kind ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'}`}>{label} ({count})</button>;
        })}
      </div>
      {visible.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(result => <Link key={result.id} to={result.path} state={{ from }} data-search-result={result.id} className="group flex gap-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all">
          {result.image ? <img src={result.image} alt="" loading="lazy" width={80} height={80} className="w-20 h-20 shrink-0 object-cover rounded-xl" /> : <span className="w-20 h-20 flex items-center justify-center shrink-0 bg-sky-50 rounded-xl text-sky-600"><SearchResultIcon kind={result.kind} label={result.label} size={28} /></span>}
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-sky-700 mb-1">{result.label}{result.kind !== 'city' && ` · ${result.cityName}`}</span>
            <span className="block font-bold text-slate-900 break-words group-hover:text-sky-700">{result.name}</span>
            {result.approximate && <span className="block text-xs text-amber-700 mt-1">Mogelijke match</span>}
            <span className="block text-sm text-slate-500 line-clamp-2 mt-2">{result.description}</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-slate-400 group-hover:text-sky-600" aria-hidden="true" />
        </Link>)}
      </div> : <div className="text-center px-6 py-12 bg-white rounded-3xl border border-dashed border-slate-200">
        <h3 className="font-bold text-xl text-slate-900 mb-3">Geen resultaten gevonden</h3>
        <p className="text-slate-600 mb-6">{results.length ? 'Probeer een ander type resultaat of kies Alles.' : 'Probeer een kortere naam, een categorie zoals “restaurant” of een badstad.'}</p>
        <button onClick={results.length ? () => setFilter('all') : onClear} className="rounded-full px-6 py-3 bg-sky-600 text-white font-bold hover:bg-sky-700">{results.length ? 'Toon alle resultaten' : 'Wis zoekopdracht'}</button>
      </div>}
    </>}
  </div>;
}
