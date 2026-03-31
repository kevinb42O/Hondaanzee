import React from 'react';
import { Filter } from 'lucide-react';
import { CITIES } from '../../cityData.ts';
import type { ReportCategory, ReportFilters as ReportFiltersValue } from '../../types.ts';
import { REPORT_CATEGORY_META } from '../../utils/reportHelpers.ts';

interface ReportFiltersProps {
  value: ReportFiltersValue;
  totalCount: number;
  onChange: (nextValue: ReportFiltersValue) => void;
}

const categoryOptions = Object.entries(REPORT_CATEGORY_META) as Array<
  [ReportCategory, { label: string }]
>;

const ReportFilters: React.FC<ReportFiltersProps> = ({ value, totalCount, onChange }) => (
  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
    <div className="border-b border-slate-100 bg-slate-950 px-5 py-4 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-sky-300" />
          <h2 className="text-lg font-black tracking-tight">Filter meldingen</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-200">
          {totalCount} {totalCount === 1 ? 'melding' : 'meldingen'}
        </div>
      </div>
    </div>

    <div className="grid gap-4 p-5 md:grid-cols-2 md:items-end">
      <label className="block">
        <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Kuststad</span>
        <select
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
        >
          <option value="all">Alle kuststeden</option>
          {CITIES.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Categorie</span>
        <select
          value={value.category}
          onChange={(event) => onChange({ ...value, category: event.target.value as ReportFiltersValue['category'] })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
        >
          <option value="all">Alle categorieën</option>
          {categoryOptions.map(([category, meta]) => (
            <option key={category} value={category}>
              {meta.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  </div>
);

export default ReportFilters;
