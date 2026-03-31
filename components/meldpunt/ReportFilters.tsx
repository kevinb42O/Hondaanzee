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
  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2 text-slate-900">
      <Filter size={18} className="text-sky-600" />
      <h2 className="text-lg font-black">Filter meldingen</h2>
    </div>

    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Kuststad</span>
        <select
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
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
        <span className="mb-2 block text-sm font-bold text-slate-700">Categorie</span>
        <select
          value={value.category}
          onChange={(event) => onChange({ ...value, category: event.target.value as ReportFiltersValue['category'] })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
        >
          <option value="all">Alle categorieën</option>
          {categoryOptions.map(([category, meta]) => (
            <option key={category} value={category}>
              {meta.label}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
        {totalCount} {totalCount === 1 ? 'melding' : 'meldingen'}
      </div>
    </div>
  </div>
);

export default ReportFilters;
